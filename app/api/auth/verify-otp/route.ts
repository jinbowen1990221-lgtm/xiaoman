import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth";
import { getMockUserByPhone } from "@/lib/mock-user-db";
import { getSafeRedirectForUser, SESSION_COOKIE } from "@/lib/session";
import { sessionCookieOptions } from "@/lib/cookie";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    phone?: string;
    code?: string;
  };
  const phone = body.phone ?? "";
  const existing = await getMockUserByPhone(phone);
  const result = await verifyOtp(phone, body.code ?? "");

  if (!result.success || !result.token) {
    return NextResponse.json(result, { status: 400 });
  }

  const user = await getMockUserByPhone(phone);
  const response = NextResponse.json({
    success: true,
    token: result.token,
    isNewUser: !existing,
    onboardingCompleted: Boolean(user?.onboarding_completed),
    nextPath: user ? getSafeRedirectForUser(user) : "/onboarding/intro"
  });
  response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions);
  return response;
}
