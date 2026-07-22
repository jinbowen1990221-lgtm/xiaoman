import { NextResponse } from "next/server";
import { AUTH_UNAVAILABLE_MESSAGE, sendOtp } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phone?: string };
  try {
    const result = await sendOtp(body.phone ?? "");
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("[AUTH] send OTP failed", error);
    return NextResponse.json({ success: false, error: AUTH_UNAVAILABLE_MESSAGE }, { status: 503 });
  }
}
