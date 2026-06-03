import { analyzeSentiment } from "@/lib/ai";
import type { PredictionCategory, StoredRecord } from "@/lib/user-types";

export type DraftPrediction = {
  content: string;
  basis: string;
  category: PredictionCategory;
  confidence: number;
};

const CATEGORIES: PredictionCategory[] = ["mood", "behavior", "sleep", "other"];
export const CATEGORY_LABEL: Record<PredictionCategory, string> = {
  mood: "情绪",
  behavior: "行为",
  sleep: "睡眠",
  other: "其他"
};

function quote(text: string, max = 18) {
  const t = (text || "").replace(/\n+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** Beijing-day string, for "is this from today?" comparisons. */
export function beijingDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date(iso));
}

/** Grounded fallback prediction — based on the user's own patterns, no AI key needed. */
export function buildForesightFallback(records: StoredRecord[]): DraftPrediction {
  if (records.length === 0) {
    return {
      content: "接下来两三天，先记下一两件小事——你会更容易看清自己在意什么。",
      basis: "你还没开始记录",
      category: "other",
      confidence: 50
    };
  }
  const latest = records[0];
  const lateNight = records.filter((r) => {
    const h = new Date(r.created_at).getHours();
    return h >= 23 || h < 5;
  }).length;

  if (lateNight >= 2) {
    return {
      content: "今晚你大概率又会晚睡、想得比较多。可以提前给自己留个台阶：写完一句就先放下。",
      basis: `你最近有 ${lateNight} 次是深夜记录的`,
      category: "sleep",
      confidence: Math.min(85, 55 + lateNight * 8)
    };
  }

  const { tone } = analyzeSentiment(latest.content);
  if (tone === "heavy") {
    return {
      content: "接下来一两天，这股沉可能还在。但你已经说出来了，它通常会慢慢变轻。",
      basis: `你刚说过“${quote(latest.content)}”`,
      category: "mood",
      confidence: 62
    };
  }
  if (tone === "warm") {
    return {
      content: "这两天的好状态有机会延续。留意一下是什么让它发生的，记下来。",
      basis: `你最近说“${quote(latest.content)}”`,
      category: "mood",
      confidence: 58
    };
  }
  return {
    content: "接下来几天大概是平稳的。平稳也值得被记住——它常是某种积累的开始。",
    basis: `据你最近写的“${quote(latest.content)}”`,
    category: "behavior",
    confidence: 55
  };
}

export function foresightPrompt(records: StoredRecord[]) {
  const recent = records
    .slice(0, 12)
    .map((r) => `- ${r.content.replace(/\n+/g, " ").trim()}`)
    .join("\n");

  const system = [
    "你是小满，一个克制、温柔、诚实的 AI 朋友。",
    "基于用户最近真实写过的记录，对 ta 接下来一两天给出【一条】具体、可被事后验证的小预判。",
    "重要原则：",
    "1) 必须基于下面的真实记录，可引用其中的词；不是算命、不谈命运、不预测外部世界，只预判『你自己』可能的状态 / 行为 / 感受；",
    "2) 要具体、可验证（能让 ta 几天后判断『中了 / 没中』），不要说『明天会更好』这种无法验证的空话；",
    "3) 温柔、留白、谦逊——你只是把 ta 说过的话连起来；",
    "4) 同时给出：category（这条预判属于哪类：mood=情绪 / behavior=行为 / sleep=睡眠 / other=其他）；confidence（你的把握，0-100 的整数，要诚实，没有强规律就给低分）；",
    '5) 只输出一个 JSON：{"prediction":"那条预判","basis":"据你…（一句话依据）","category":"mood","confidence":60}，不要代码块、不要多余文字。',
    `ta 最近写的：\n${recent || "（暂无）"}`
  ].join("\n");

  const user = "请只输出那个 JSON。";
  return { system, user };
}

export function parseForesight(raw: string): DraftPrediction | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const s = cleaned.indexOf("{");
    const e = cleaned.lastIndexOf("}");
    if (s < 0 || e < 0) return null;
    const obj = JSON.parse(cleaned.slice(s, e + 1)) as {
      prediction?: unknown;
      basis?: unknown;
      category?: unknown;
      confidence?: unknown;
    };
    const content = typeof obj.prediction === "string" ? obj.prediction.trim() : "";
    if (!content) return null;
    const basis = typeof obj.basis === "string" ? obj.basis.trim() : "";
    const category = CATEGORIES.includes(obj.category as PredictionCategory)
      ? (obj.category as PredictionCategory)
      : "other";
    const confRaw = Math.round(Number(obj.confidence));
    const confidence = Number.isFinite(confRaw) ? Math.max(0, Math.min(100, confRaw)) : 55;
    return { content, basis, category, confidence };
  } catch {
    return null;
  }
}
