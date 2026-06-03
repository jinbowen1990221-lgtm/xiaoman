import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { beijingDay } from "@/lib/date";
import { buildReadingFallback, readingPrompt, selectQuote } from "@/lib/literary";
import { getRecordsForUser } from "@/lib/mock-user-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const all = await getRecordsForUser(user.id, 30);
  if (all.length === 0) {
    return NextResponse.json({ empty: true });
  }

  // prefer today's entries; fall back to recent ones so there's always something
  const today = beijingDay();
  const todays = all.filter((r) => beijingDay(r.created_at) === today);
  const basis = todays.length ? todays : all.slice(0, 5);

  const quote = selectQuote(basis);
  const fallback = buildReadingFallback(basis, quote);
  const { system, user: prompt } = readingPrompt(basis, quote);
  const llm = await callLLM(system, prompt);
  const reading = (llm ?? fallback).replace(/^["“「]+|["”」]+$/g, "").trim();

  return NextResponse.json({
    reading: reading || fallback,
    quote: { text: quote.text, author: quote.author, source: quote.source }
  });
}
