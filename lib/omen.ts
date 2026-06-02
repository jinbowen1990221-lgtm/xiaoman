import type { StoredRecord } from "@/lib/user-types";

function quote(text: string, max = 20) {
  const t = (text || "").replace(/\n+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** Grounded fallback "今日预感" — gentle, quotes the user, no fortune-telling. */
export function buildOmenFallback(records: StoredRecord[], choice: string): string {
  if (records.length === 0) {
    return `你选了「${choice}」。今天还没说什么也没关系——把它当作一个轻轻的提醒：对自己「${choice}」一点，会松一点。`;
  }
  const latest = records[0];
  return `你最近说过“${quote(latest.content)}”。今天试着对自己「${choice}」一点，不用急着要答案。`;
}

export function omenPrompt(records: StoredRecord[], choice: string) {
  const recent = records
    .slice(0, 8)
    .map((r) => `- ${r.content}`)
    .join("\n");

  const system = [
    "你是小满，一个克制、温柔的 AI 朋友。",
    `用户此刻最想听到的词是「${choice}」。给 ta 写一段简短的『今日预感』。`,
    "要求：",
    "1) 结合 ta 真实写过的内容（可轻轻引用其中一句）和这个词；",
    "2) 温柔、留白、像朋友的话——不是算命、不夸大、不打包票；",
    "3) 两到三句话以内；",
    "4) 不要加称呼，不要给整段加引号，不要解释你在做什么。",
    `ta 最近写的：\n${recent || "（暂无）"}`
  ].join("\n");

  const user = "请只输出那段今日预感。";
  return { system, user };
}
