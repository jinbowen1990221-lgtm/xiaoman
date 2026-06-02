import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phone?: string };
  const result = await sendOtp(body.phone ?? "");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
