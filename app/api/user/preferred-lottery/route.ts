import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/cookie";
import { updateMockUser } from "@/lib/mock-user-db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import type { PreferredLottery } from "@/lib/user-types";

const lotteryTypes: PreferredLottery[] = ["double_color", "super_lotto", "arrangement_3"];

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    preferred_lottery?: PreferredLottery;
  };
  if (!body.preferred_lottery || !lotteryTypes.includes(body.preferred_lottery)) {
    return NextResponse.json({ error: "彩种不对" }, { status: 400 });
  }

  const user = await updateMockUser(currentUser.phone, {
    preferred_lottery: body.preferred_lottery
  });
  const token = await createSessionToken(user);
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
