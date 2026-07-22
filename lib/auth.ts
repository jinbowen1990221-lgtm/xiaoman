import { cookies } from "next/headers";
import { getMockUserByPhone, getOrCreateMockUser } from "@/lib/mock-user-db";
import { canSend, checkCode, issueCode } from "@/lib/otp";
import { createSessionToken, readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { sendSms, smsEnabled } from "@/lib/sms";
import type { User } from "@/lib/user-types";

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return (await readSessionToken(token))?.user ?? null;
}

// Dev master code — only honored when real SMS is NOT configured, for local testing.
// Trimmed for safety (env values sometimes carry stray whitespace).
const DEV_OTP = (process.env.DEV_OTP ?? "123456").trim();
export const AUTH_UNAVAILABLE_MESSAGE = "验证码服务暂时不可用，请稍后再试";

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!/^\d{11}$/.test(phone)) {
    return { success: false, error: "手机号格式不对" };
  }

  const gate = await canSend(phone);
  if (!gate.ok) {
    return { success: false, error: `${gate.waitSec ?? 60} 秒后再试` };
  }

  const code = await issueCode(phone);
  const sent = await sendSms(phone, code);
  if (!sent.ok) {
    throw new Error(sent.reason ?? "SMS provider rejected the request");
  }
  return { success: true };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ success: boolean; token?: string; user?: User; isNewUser?: boolean; error?: string }> {
  if (!/^\d{11}$/.test(phone) || !/^\d{6}$/.test((code ?? "").trim())) {
    return { success: false, error: "手机号或验证码格式不对" };
  }

  // The fixed code is local-development-only. Production always verifies the
  // one-time code stored in Supabase, even if ALLOW_DEV_OTP was left behind.
  const entered = (code ?? "").trim();
  const devBypass = process.env.NODE_ENV !== "production" && !smsEnabled() && entered === DEV_OTP;

  if (!devBypass) {
    const result = await checkCode(phone, entered);
    if (result === "expired") return { success: false, error: "验证码过期了，重新发一个" };
    if (result === "too_many") return { success: false, error: "试太多次了，稍后再来" };
    if (result === "mismatch") return { success: false, error: "验证码不对，再试一次" };
  }

  const existing = await getMockUserByPhone(phone);
  const user = existing ?? (await getOrCreateMockUser(phone));
  return {
    success: true,
    token: await createSessionToken(user),
    user,
    isNewUser: !existing
  };
}

export async function logout(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}
