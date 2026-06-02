import { NextResponse } from "next/server";
import { callLLM, scoreForRecords } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { getRecordsForUser } from "@/lib/mock-user-db";
import { buildOmenFallback, omenPrompt } from "@/lib/omen";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const choice = new URL(request.url).searchParams.get("choice")?.slice(0, 10) || "转机";
  const records = await getRecordsForUser(user.id, 12);

  // possibility comes from real sentiment, not a fixed number
  const possibility = scoreForRecords(records);
  const fallback = buildOmenFallback(records, choice);

  const { system, user: prompt } = omenPrompt(records, choice);
  const llm = await callLLM(system, prompt);
  const text = (llm ?? fallback).replace(/^["“「']+|["”」']+$/g, "").trim();

  return NextResponse.json({ text: text || fallback, possibility });
}
