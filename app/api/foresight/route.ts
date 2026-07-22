import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { beijingDay, buildForesightFallback, foresightPrompt, parseForesight } from "@/lib/foresight";
import {
  createPrediction,
  getPredictionsForUser,
  getRecordsForUser,
  updatePredictionStatus
} from "@/lib/mock-user-db";
import type { PredictionStatus } from "@/lib/user-types";

function persistenceUnavailable(error: unknown) {
  console.error("[foresight-api] persistence unavailable", error);
  return NextResponse.json({ error: "暂时没存好，请稍后再试" }, { status: 503 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const predictions = await getPredictionsForUser(user.id, 40);
    const today = beijingDay(new Date().toISOString());

    let todayPrediction = predictions.find((p) => beijingDay(p.created_at) === today) ?? null;

    // generate today's prediction once, only if the user has something to ground it in
    if (!todayPrediction) {
      const records = await getRecordsForUser(user.id, 12);
      if (records.length > 0) {
        const { system, user: prompt } = foresightPrompt(records);
        const raw = await callLLM(system, prompt);
        const parsed = (raw && parseForesight(raw)) || buildForesightFallback(records);
        todayPrediction = await createPrediction(user.id, parsed);
      }
    }

    // past predictions still awaiting the user's verdict (not today's)
    const pending = predictions
      .filter((p) => p.status === "pending" && beijingDay(p.created_at) !== today)
      .slice(0, 2);

    const verified = predictions.filter((p) => p.status !== "pending");
    const stats = {
      hit: verified.filter((p) => p.status === "hit").length,
      partial: verified.filter((p) => p.status === "partial").length,
      total: verified.length
    };

    return NextResponse.json({ today: todayPrediction, pending, stats });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { id?: string; result?: string };
  const valid: PredictionStatus[] = ["hit", "partial", "miss"];
  if (!body.id || !valid.includes(body.result as PredictionStatus)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  try {
    const updated = await updatePredictionStatus(body.id, user.id, body.result as PredictionStatus);
    if (!updated) return NextResponse.json({ error: "没找到这条预感" }, { status: 404 });
    return NextResponse.json({ ok: true, prediction: updated });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}
