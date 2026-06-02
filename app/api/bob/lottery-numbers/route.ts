import { NextResponse } from "next/server";
import { generateLotteryNumbers, type LotteryType } from "@/lib/lottery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "demo-user";
  const birthday = searchParams.get("birthday") ?? "2001-04-21";
  const type = (searchParams.get("type") ?? "double_color") as LotteryType;
  const result = generateLotteryNumbers(birthday, userId, type);

  return NextResponse.json(result);
}
