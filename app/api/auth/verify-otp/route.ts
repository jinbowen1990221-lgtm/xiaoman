import { NextResponse } from "next/server";
import { AUTH_UNAVAILABLE_MESSAGE, verifyOtp } from "@/lib/auth";
import { getSafeRedirectForUser, SESSION_COOKIE } from "@/lib/session";
import { sessionCookieOptions } from "@/lib/cookie";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    phone?: string;
    code?: string;
  };
  const phone = body.phone ?? "";
  try {
    const result = await verifyOtp(phone, body.code ?? "");

    if (!result.success || !result.token || !result.user) {
      return NextResponse.json(result, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      isNewUser: result.isNewUser,
      onboardingCompleted: Boolean(result.user.onboarding_completed),
      nextPath: getSafeRedirectForUser(result.user)
    });
    response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("[AUTH] verify OTP failed", error);
    return NextResponse.json({ success: false, error: AUTH_UNAVAILABLE_MESSAGE }, { status: 503 });
  }
}
