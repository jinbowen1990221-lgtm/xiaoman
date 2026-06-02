import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { buildDailyNoteFallback, dailyNotePrompt } from "@/lib/daily-note";
import { getRecordsForUser } from "@/lib/mock-user-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const records = await getRecordsForUser(user.id, 12);
  const fallback = buildDailyNoteFallback(records);

  const { system, user: prompt } = dailyNotePrompt(records);
  const llm = await callLLM(system, prompt);

  // strip wrapping quotes the model sometimes adds
  const text = (llm ?? fallback).replace(/^["“「']+|["”」']+$/g, "").trim();
  return NextResponse.json({ text: text || fallback });
}
