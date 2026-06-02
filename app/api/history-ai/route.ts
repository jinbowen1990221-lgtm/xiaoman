import { NextResponse } from "next/server";
import { callLLM, emotionCurve } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { historyAiPrompt, parseHistoryAi } from "@/lib/history-ai";
import { buildSummary } from "@/lib/journal";
import { getRecordsForUser } from "@/lib/mock-user-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const recent = await getRecordsForUser(user.id, 7); // newest first
  const heuristicCurve = emotionCurve(recent); // oldest → newest
  const heuristicSummary = buildSummary(recent) ?? "";

  const ordered = [...recent].reverse(); // oldest → newest, matches scores order
  if (ordered.length === 0) {
    return NextResponse.json({ summary: heuristicSummary, curve: heuristicCurve });
  }

  const { system, user: prompt } = historyAiPrompt(ordered);
  const raw = await callLLM(system, prompt);
  const parsed = raw ? parseHistoryAi(raw, ordered.length) : null;

  if (parsed) {
    return NextResponse.json({
      summary: parsed.letter,
      curve: parsed.scores.length >= 2 ? parsed.scores : heuristicCurve
    });
  }

  return NextResponse.json({ summary: heuristicSummary, curve: heuristicCurve });
}
