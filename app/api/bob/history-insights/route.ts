import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildHistoryInsights } from "@/lib/history-insights";
import { getCoinFlipsForUser } from "@/lib/mock-user-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "week";
  const user = await getCurrentUser();
  const insights = user ? buildHistoryInsights(await getCoinFlipsForUser(user.id, 12)) : buildHistoryInsights([]);

  return NextResponse.json({
    range,
    ...insights
  });
}
