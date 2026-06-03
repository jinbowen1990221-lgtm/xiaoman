import type { StoredRecord } from "@/lib/user-types";

export type Decision = { analysis: string; lean: "a" | "b" | "none"; basis: string };

/** Honest fallback — no records / no AI: reflect, never fabricate a pattern. */
export function buildDecisionFallback(): Decision {
  return {
    analysis:
      "这种纠结，往往说明两个选择你都有点舍不得。试着想象一下：选完哪个，今晚临睡前你会更踏实？那个答案，可能就是你心里已经知道的。",
    lean: "none",
    basis: ""
  };
}

export function decisionPrompt(records: StoredRecord[], optionA: string, optionB: string) {
  const recent = records
    .slice(0, 12)
    .map((r) => `- ${r.content.replace(/\n+/g, " ").trim()}`)
    .join("\n");

  const system = [
    "你是小满，一个克制、温柔、诚实的 AI 朋友。",
    `用户在两个选择之间纠结：A =「${optionA}」 B =「${optionB}」。`,
    "基于 ta 真实写过的记录，做一段『决策推演』：",
    "1) 找出与这个决定相关的历史线索或规律，引用 ta 真实写过的话（例如：你每次选了忍着不说，第二天都写了闷）；如果记录里确实没有相关线索，就诚实说『这件事你没怎么写过』，绝不编造；",
    "2) 温柔地给一个倾向，但强调最终由 ta 决定——不下命令、不评判；",
    "3) 只输出 JSON：{\"analysis\":\"一段话(2到4句)\",\"lean\":\"a 或 b 或 none\",\"basis\":\"一句话依据\"}，不要代码块、不要多余文字。",
    `ta 最近写的：\n${recent || "（暂无）"}`
  ].join("\n");

  const user = "请只输出那个 JSON。";
  return { system, user };
}

export function parseDecision(raw: string): Decision | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s < 0 || e < 0) return null;
    const obj = JSON.parse(cleaned.slice(s, e + 1)) as {
      analysis?: unknown;
      lean?: unknown;
      basis?: unknown;
    };
    const analysis = typeof obj.analysis === "string" ? obj.analysis.trim() : "";
    if (!analysis) return null;
    const lean = obj.lean === "a" || obj.lean === "b" ? obj.lean : "none";
    const basis = typeof obj.basis === "string" ? obj.basis.trim() : "";
    return { analysis, lean, basis };
  } catch {
    return null;
  }
}
