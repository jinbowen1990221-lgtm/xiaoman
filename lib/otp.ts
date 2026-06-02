/* ============================================================
   验证码存储（开发：内存；生产建议换 Redis / Supabase 表 + TTL）
   - 随机 6 位码、5 分钟有效、60 秒发送间隔、最多 5 次尝试
   ============================================================ */

type OtpEntry = { code: string; expiresAt: number; attempts: number; lastSentAt: number };

const globalForOtp = globalThis as unknown as { __bobOtp?: Map<string, OtpEntry> };
const store = globalForOtp.__bobOtp ?? new Map<string, OtpEntry>();
globalForOtp.__bobOtp = store;

const TTL_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export function canSend(phone: string): { ok: boolean; waitSec?: number } {
  const e = store.get(phone);
  if (!e) return { ok: true };
  const since = Date.now() - e.lastSentAt;
  if (since < RESEND_GAP_MS) return { ok: false, waitSec: Math.ceil((RESEND_GAP_MS - since) / 1000) };
  return { ok: true };
}

export function issueCode(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(phone, { code, expiresAt: Date.now() + TTL_MS, attempts: 0, lastSentAt: Date.now() });
  return code;
}

export type VerifyResult = "ok" | "expired" | "mismatch" | "too_many";

export function checkCode(phone: string, code: string): VerifyResult {
  const e = store.get(phone);
  if (!e || Date.now() > e.expiresAt) return "expired";
  if (e.attempts >= MAX_ATTEMPTS) return "too_many";
  e.attempts += 1;
  if (e.code !== code) return "mismatch";
  store.delete(phone); // one-time use
  return "ok";
}
