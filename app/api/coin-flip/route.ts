import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCoinFlip, updateCoinFlipFollowed } from "@/lib/mock-user-db";

function persistenceUnavailable(error: unknown) {
  console.error("[coin-flip-api] persistence unavailable", error);
  return NextResponse.json(
    { success: false, error: "暂时没记住这次结果，请稍后再试" },
    { status: 503 }
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    option_a?: string;
    option_b?: string;
    result?: "a" | "b";
    bob_comment?: string;
  };

  if (!body.option_a || !body.option_b || (body.result !== "a" && body.result !== "b")) {
    return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
  }

  try {
    const coinFlip = await createCoinFlip(user.id, {
      option_a: body.option_a.slice(0, 200),
      option_b: body.option_b.slice(0, 200),
      result: body.result,
      bob_comment: body.bob_comment?.slice(0, 120) ?? null
    });

    return NextResponse.json({ success: true, id: coinFlip.id });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    followed?: boolean;
  };
  if (!body.id || typeof body.followed !== "boolean") {
    return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
  }

  try {
    const coinFlip = await updateCoinFlipFollowed(user.id, body.id, body.followed);
    if (!coinFlip) {
      return NextResponse.json({ success: false, error: "没找到记录" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}
