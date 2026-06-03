import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { buildDecisionFallback, decisionPrompt, parseDecision } from "@/lib/decision";
import { getRecordsForUser } from "@/lib/mock-user-db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { optionA?: string; optionB?: string };
  const optionA = (body.optionA ?? "").trim().slice(0, 60) || "A";
  const optionB = (body.optionB ?? "").trim().slice(0, 60) || "B";

  const records = await getRecordsForUser(user.id, 12);
  const { system, user: prompt } = decisionPrompt(records, optionA, optionB);
  const raw = await callLLM(system, prompt);
  const decision = (raw && parseDecision(raw)) || buildDecisionFallback();

  return NextResponse.json(decision);
}
