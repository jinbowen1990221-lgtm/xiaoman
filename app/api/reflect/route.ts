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
    "你是小满，一个温柔、真诚、懂分寸的 AI 朋友。用户刚写下一条记录。",
    "先判断这条更偏『情绪倾诉』还是『具体问题 / 纠结』，再决定怎么回：",
    "· 情绪类（如「就是不想上班」「好累」「难过」）：先接住并肯定 ta 的感受，给一点温暖、让 ta 松一口气的话。不要连环追问『为什么』，不要把问题丢回给 ta。",
    "· 问题 / 纠结类（如「要不要换工作」「该怎么办」）：在共情之后，给【一个】具体、可行的小建议或换个角度的思路，帮 ta 真的往前走一步。",
    "语气像朋友，温柔、不说教、不客服腔、不空话、不要解释你在分析。",
    "输出两行：第一行是你的回应；第二行——情绪类写一句温柔的陪伴话，问题类写那条具体的小建议。两行都简短。",
    `结合 ta 最近的记录理解语境：\n${recent || "（暂无）"}`
  ].join("\n");
  const llm = await callLLM(system, `这条记录：${content}\n请按上面的要求，只输出两行。`);

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
