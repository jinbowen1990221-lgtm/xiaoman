import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildReflection, callLLM } from "@/lib/ai";
import { getRecordsForUser } from "@/lib/mock-user-db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { content?: string };
  const content = (body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "空内容" }, { status: 400 });

  // grounded heuristic baseline (always works)
  const base = buildReflection(content);

  // optional LLM upgrade — keeps 小满 persona, stays a reflection (not advice)
  const recent = (await getRecordsForUser(user.id, 8))
    .map((r) => `- ${r.content}`)
    .join("\n");
  const system = [
    "你是小满，一个克制、安静的 AI 朋友。用户刚写下一条记录。",
    "只回一句温柔的『映照』(共情，不评判) + 一个轻轻的问句。",
    "不要给建议、不要说教、不要客服腔、不要解释你在分析。两行以内。",
    `用户最近的记录：\n${recent || "（暂无）"}`
  ].join("\n");
  const llm = await callLLM(system, `这条记录：${content}\n请只输出两行：第一行映照，第二行一个问句。`);

  if (llm) {
    const [line, question] = llm.split("\n").map((s) => s.replace(/^[-•\d.\s]+/, "").trim()).filter(Boolean);
    return NextResponse.json({
      line: line ?? base.line,
      question: question ?? base.question,
      tone: base.tone
    });
  }

  return NextResponse.json(base);
}
