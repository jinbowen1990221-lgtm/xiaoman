import { cookies } from "next/headers";
import { getOrCreateMockUser } from "@/lib/mock-user-db";
import { canSend, checkCode, issueCode } from "@/lib/otp";
import { createSessionToken, readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { sendSms, smsEnabled } from "@/lib/sms";
import type { User } from "@/lib/user-types";

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return (await readSessionToken(token))?.user ?? null;
}

// Dev master code — only honored when real SMS is NOT configured, for local testing.
const DEV_OTP = process.env.DEV_OTP ?? "123456";

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!/^\d{11}$/.test(phone)) {
    return { success: false, error: "手机号格式不对" };
  }

  const gate = canSend(phone);
  if (!gate.ok) {
    return { success: false, error: `${gate.waitSec ?? 60} 秒后再试` };
  }

  const code = issueCode(phone);
  const sent = await sendSms(phone, code);
  if (!sent) {
    return { success: false, error: "没发出去，再试一次" };
  }
  return { success: true };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  // dev master code only when SMS is off (local/testing)
  const devBypass = !smsEnabled() && code === DEV_OTP;

  if (!devBypass) {
    const result = checkCode(phone, code);
    if (result === "expired") return { success: false, error: "验证码过期了，重新发一个" };
    if (result === "too_many") return { success: false, error: "试太多次了，稍后再来" };
    if (result === "mismatch") return { success: false, error: "验证码不对，再试一次" };
  }

  const user = await getOrCreateMockUser(phone);
  return { success: true, token: await createSessionToken(user) };
}

export async function logout(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}
