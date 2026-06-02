import type { StoredRecord } from "@/lib/user-types";

/** Prompt: one call returns both the woven "letter" and per-record sentiment. */
export function historyAiPrompt(ordered: StoredRecord[]) {
  const list = ordered
    .map((r, i) => `${i + 1}. ${r.content.replace(/\n+/g, " ").trim()}`)
    .join("\n");

  const system = [
    "你是小满，一个克制、温柔、安静的 AI 朋友。",
    "下面是用户最近的记录（按时间从早到晚编号）。",
    "请只输出一个 JSON 对象，不要任何额外文字、不要代码块标记，格式：",
    '{"letter": "一段话", "scores": [数字, ...]}',
    "letter：两到三句，像写给 ta 的一小段话，串联这些记录、轻轻引用其中真实出现过的词；只共情、不评判、不说教、不给建议；",
    "scores：给每一条记录一个 0-100 的整数（情绪越积极越高），数组长度必须等于记录条数，顺序与编号一致。",
    `记录：\n${list}`
  ].join("\n");

  const user = "请只输出那个 JSON。";
  return { system, user };
}

export function parseHistoryAi(
  raw: string,
  count: number
): { letter: string; scores: number[] } | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end < 0) return null;
    const obj = JSON.parse(cleaned.slice(start, end + 1)) as {
      letter?: unknown;
      scores?: unknown;
    };
    const letter = typeof obj.letter === "string" ? obj.letter.trim() : "";
    if (!letter) return null;
    const scores = Array.isArray(obj.scores)
      ? obj.scores
          .map((n) => Math.max(0, Math.min(100, Math.round(Number(n)))))
          .filter((n) => Number.isFinite(n))
          .slice(0, count)
      : [];
    return { letter, scores };
  } catch {
    return null;
  }
}
