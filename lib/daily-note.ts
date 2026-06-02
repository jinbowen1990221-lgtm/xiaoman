import type { StoredRecord } from "@/lib/user-types";

function quote(text: string, max = 22) {
  const t = (text || "").replace(/\n+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/**
 * Grounded fallback "letter" — quotes the user's own latest words, never
 * fabricates. Used when no LLM key is set, or as the instant baseline while
 * the AI version loads.
 */
export function buildDailyNoteFallback(records: StoredRecord[]): string {
  if (records.length === 0) {
    return "今天还没说话也没关系，我在。想到什么，一句就好。";
  }
  const latest = records[0];
  return `还记得你说的“${quote(latest.content, 20)}”。今天我也陪着你，慢慢来。`;
}

/** System + user prompt for the daily note, grounded in real records. */
export function dailyNotePrompt(records: StoredRecord[]) {
  const recent = records
    .slice(0, 10)
    .map((r) => `- ${r.content}`)
    .join("\n");

  const system = [
    "你是小满，一个克制、温柔、安静的 AI 朋友。",
    "现在给用户写一句『今日小记』——像随手写给 ta 的一张小纸条。",
    "要求：",
    "1) 必须基于下面 ta 真实写过的内容，可以轻轻引用其中一句；",
    "2) 不评判、不说教、不给建议、不要客服腔；",
    "3) 一到两句话，简短、温暖、留白；",
    "4) 不要加称呼，不要给整段加引号，不要解释你在做什么。",
    `ta 最近写的：\n${recent || "（暂无）"}`
  ].join("\n");

  const user = "请只输出那一句今日小记。";
  return { system, user };
}
