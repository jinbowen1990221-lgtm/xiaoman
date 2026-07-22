import { getSupabase } from "@/lib/supabase";

/* ============================================================
   验证码存储
   - 配了 Supabase → 存表（serverless 多实例间共享，可靠）
   - 否则内存兜底（本地开发）
   规则：随机 6 位、5 分钟有效、60 秒发送间隔、最多 5 次尝试
   ============================================================ */

type OtpEntry = { code: string; expiresAt: number; attempts: number; lastSentAt: number };

const globalForOtp = globalThis as unknown as { __bobOtp?: Map<string, OtpEntry> };
const store = globalForOtp.__bobOtp ?? new Map<string, OtpEntry>();
globalForOtp.__bobOtp = store;

const TTL_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export type VerifyResult = "ok" | "expired" | "mismatch" | "too_many";

type OtpRow = {
  phone: string;
  code: string;
  expires_at: string;
  attempts: number;
  last_sent_at: string;
};

export class OtpStorageError extends Error {
  constructor(operation: string, cause?: unknown) {
    super(`OTP storage failed while trying to ${operation}`, { cause });
    this.name = "OtpStorageError";
  }
}

function getOtpClient(operation: string) {
  const client = getSupabase();
  if (!client && process.env.NODE_ENV === "production") {
    throw new OtpStorageError(operation, new Error("Supabase is not configured"));
  }
  return client;
}

function checkStorageError(operation: string, error: unknown) {
  if (error) throw new OtpStorageError(operation, error);
}

export async function canSend(phone: string): Promise<{ ok: boolean; waitSec?: number }> {
  const sb = getOtpClient("check resend limit");
  if (sb) {
    const { data, error } = await sb
      .from("otp_codes")
      .select("last_sent_at")
      .eq("phone", phone)
      .maybeSingle();
    checkStorageError("check resend limit", error);
    if (!data) return { ok: true };
    const since = Date.now() - new Date((data as OtpRow).last_sent_at).getTime();
    if (since < RESEND_GAP_MS) return { ok: false, waitSec: Math.ceil((RESEND_GAP_MS - since) / 1000) };
    return { ok: true };
  }

  const e = store.get(phone);
  if (!e) return { ok: true };
  const since = Date.now() - e.lastSentAt;
  if (since < RESEND_GAP_MS) return { ok: false, waitSec: Math.ceil((RESEND_GAP_MS - since) / 1000) };
  return { ok: true };
}

export async function issueCode(phone: string): Promise<string> {
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  const code = String(100000 + (random % 900000));
  const now = Date.now();
  const sb = getOtpClient("store verification code");
  if (sb) {
    const { error } = await sb.from("otp_codes").upsert(
      {
        phone,
        code,
        expires_at: new Date(now + TTL_MS).toISOString(),
        attempts: 0,
        last_sent_at: new Date(now).toISOString()
      },
      { onConflict: "phone" }
    );
    checkStorageError("store verification code", error);
    return code;
  }
  store.set(phone, { code, expiresAt: now + TTL_MS, attempts: 0, lastSentAt: now });
  return code;
}

export async function checkCode(phone: string, code: string): Promise<VerifyResult> {
  const sb = getOtpClient("verify code");
  if (sb) {
    const { data, error } = await sb.rpc("verify_otp_code", {
      p_phone: phone,
      p_code: code
    });
    checkStorageError("verify and consume code", error);
    if (data === "ok" || data === "expired" || data === "mismatch" || data === "too_many") {
      return data;
    }
    throw new OtpStorageError("verify and consume code", new Error("Unexpected database result"));
  }

  const e = store.get(phone);
  if (!e || Date.now() > e.expiresAt) return "expired";
  if (e.attempts >= MAX_ATTEMPTS) return "too_many";
  e.attempts += 1;
  if (e.code !== code) return "mismatch";
  store.delete(phone);
  return "ok";
}
