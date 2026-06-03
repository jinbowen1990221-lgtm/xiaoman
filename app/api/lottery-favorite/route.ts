import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createLotteryFavorite,
  deleteLotteryFavorite,
  getLotteryFavorites
} from "@/lib/mock-user-db";
import type { PreferredLottery } from "@/lib/user-types";

const TYPES: PreferredLottery[] = ["double_color", "super_lotto", "arrangement_3"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json({ favorites: await getLotteryFavorites(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    reds?: number[];
    blues?: number[];
    narrative?: string;
  };
  const type = TYPES.includes(body.type as PreferredLottery)
    ? (body.type as PreferredLottery)
    : "double_color";
  const reds = Array.isArray(body.reds) ? body.reds.map(Number).filter(Number.isFinite) : [];
  const blues = Array.isArray(body.blues) ? body.blues.map(Number).filter(Number.isFinite) : [];
  if (reds.length === 0) return NextResponse.json({ error: "没有可收藏的号码" }, { status: 400 });

  // avoid exact duplicates
  const existing = await getLotteryFavorites(user.id, 50);
  const dup = existing.find(
    (f) => f.type === type && f.reds.join(",") === reds.join(",") && f.blues.join(",") === blues.join(",")
  );
  if (dup) return NextResponse.json({ favorite: dup, duplicate: true });

  const favorite = await createLotteryFavorite(user.id, {
    type,
    reds,
    blues,
    narrative: (body.narrative ?? "").slice(0, 200)
  });
  return NextResponse.json({ favorite });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  await deleteLotteryFavorite(body.id, user.id);
  return NextResponse.json({ ok: true });
}
