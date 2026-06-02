import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  emptyLotteryNumbers,
  generateAllLotteryNumbers,
  type LotteryType
} from "@/lib/lottery";

const lotteryTypes: LotteryType[] = ["double_color", "super_lotto", "arrangement_3"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const numbers = user.birthday
    ? generateAllLotteryNumbers(user.birthday, user.id)
    : Object.fromEntries(lotteryTypes.map((type) => [type, emptyLotteryNumbers(type)]));

  return NextResponse.json({
    ...numbers,
    preferred_lottery: user.preferred_lottery,
    requires_birthday: !user.birthday
  });
}
