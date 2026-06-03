import { analyzeSentiment, buildThemes } from "@/lib/ai";
import type { StoredRecord } from "@/lib/user-types";

/**
 * Derived fallback "今日小记" — a fresh gentle line based on the overall tone
 * (and a recurring theme if there is one), NOT a verbatim quote of the diary.
 * Used when no LLM key is set, or as the instant baseline while the AI loads.
 */
export function buildDailyNoteFallback(records: StoredRecord[]): string {
  if (records.length === 0) {
    return "今天还没说话也没关系，我在。想到什么，一句就好。";
  }

  // tone across the most recent few entries (not a quote)
  const recentText = records
    .slice(0, 5)
    .map((r) => r.content)
    .join("。");
  const { tone } = analyzeSentiment(recentText);
  const theme = buildThemes(records, 1)[0]?.label;

  const base: Record<string, string> = {
    heavy: "这阵子心里像是压着点什么。你愿意把它写下来，已经是在好好照顾自己了。",
    warm: "最近有一些发亮的瞬间。记住是什么让它们发生的，它们会再来。",
    spark: "你最近冒出过一些念头。先别急着评判，让它们在心里多待一会儿。",
    calm: "日子平平地过着。平稳也是一种好——是慢慢积蓄的样子。"
  };

  let line = base[tone] ?? base.calm;
  if (theme) line += `关于「${theme}」，你想了不少，我都记着。`;
  return line;
}

/** System + user prompt for the daily note — derive, do not echo. */
export function dailyNotePrompt(records: StoredRecord[]) {
  const recent = records
    .slice(0, 10)
    .map((r) => `- ${r.content}`)
    .join("\n");

  const system = [
    "你是小满，一个克制、温柔、安静的 AI 朋友。",
    "根据 ta 最近写的内容，写一句『今日小记』——这是【你】（小满）写给 ta 的一句话。",
    "要求：",
    "1) 是你的观察、体会或祝愿，从 ta 的记录里提炼，而【不是复述】——不要原样照抄、不要整句引用 ta 写的话；",
    "2) 不评判、不说教、不给建议、不要客服腔；",
    "3) 一到两句，简短、温暖、有留白；",
    "4) 不要加称呼、不要加引号、不要解释你在做什么。",
    `ta 最近写的：\n${recent || "（暂无）"}`
  ].join("\n");

  const user = "请只输出那一句今日小记（用你自己的话）。";
  return { system, user };
}
