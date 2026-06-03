import type { StoredRecord } from "@/lib/user-types";

/* ============================================================
   小满 AI layer
   - Works today with grounded heuristics (no key needed).
   - If an OpenAI-compatible key is configured, callLLM() can be
     used by callers to upgrade copy while keeping the same shape.
   All outputs stay grounded in the user's real records.
   ============================================================ */

/* ---------------- sentiment ---------------- */

const HEAVY = [
  "累", "烦", "难过", "焦虑", "压力", "崩溃", "失眠", "睡不着", "孤独",
  "怕", "担心", "委屈", "烦躁", "没意思", "不想", "痛", "丧", "emo",
  "哭", "糟", "烂", "无聊", "空", "迷茫", "恐慌", "心累"
];
const WARM = [
  "开心", "高兴", "舒服", "喜欢", "爱", "温暖", "治愈", "轻松", "期待",
  "满足", "幸福", "好运", "笑", "美", "甜", "踏实", "感动", "值得", "暖"
];
const SPARK = ["灵感", "想到", "决定", "想做", "计划", "试试", "点子", "突然明白", "顿悟"];

export type Tone = "heavy" | "warm" | "spark" | "calm";
export type Sentiment = { score: number; tone: Tone };

function countHits(text: string, words: string[]) {
  return words.reduce((n, w) => (text.includes(w) ? n + 1 : n), 0);
}

export function analyzeSentiment(text: string): Sentiment {
  const t = (text || "").trim();
  if (!t) return { score: 55, tone: "calm" };

  const heavy = countHits(t, HEAVY);
  const warm = countHits(t, WARM);
  const spark = countHits(t, SPARK);

  let score = 60 + warm * 9 - heavy * 11 + spark * 3;
  score = Math.max(20, Math.min(95, score));

  let tone: Tone = "calm";
  if (spark > 0 && spark >= warm && spark >= heavy) tone = "spark";
  else if (heavy > warm) tone = "heavy";
  else if (warm > heavy) tone = "warm";

  return { score, tone };
}

/** Average sentiment of a set of records (e.g. today's). */
export function scoreForRecords(records: StoredRecord[]): number {
  if (records.length === 0) return 60;
  const sum = records.reduce((acc, r) => acc + analyzeSentiment(r.content).score, 0);
  return Math.round(sum / records.length);
}

/** Last N records as a small emotion curve, oldest → newest. */
export function emotionCurve(records: StoredRecord[], n = 7): number[] {
  return records
    .slice(0, n)
    .map((r) => analyzeSentiment(r.content).score)
    .reverse();
}

/* ---------------- 温柔回应（reflection on a fresh record） ---------------- */

export type Reflection = { line: string; question: string; tone: Tone };

// emotional venting → comfort (no interrogation); the second line is companionship.
const REFLECTIONS: Record<Tone, { line: string; question: string }[]> = {
  heavy: [
    { line: "这一条有点沉，我先接着。你不用现在就想明白。", question: "别急，慢慢来，我一直在。" },
    { line: "听起来今天不太轻松。能说出来，已经很好了。", question: "先歇一会儿，这股累会慢慢散的。" }
  ],
  warm: [
    { line: "这种舒服的瞬间，值得被记下来。", question: "把这点暖留着，明天会更容易找回来。" },
    { line: "我也跟着松了口气，真为你高兴。", question: "今天的你，挺好的。" }
  ],
  spark: [
    { line: "这个念头有点亮，别让它溜走。", question: "先别评判它，让它在心里多待一会儿。" },
    { line: "我记下了，这个想法不轻。", question: "想做的话，挑最小的一步先开始。" }
  ],
  calm: [
    { line: "嗯，我听到了。", question: "平平淡淡也是一天，我陪着你。" },
    { line: "今天就这样过着，也挺好。", question: "我都记着了。" }
  ]
};

// concrete problem / 纠结 → acknowledge + a small actionable nudge (not a probe).
const PROBLEM_REPLIES: { line: string; question: string }[] = [
  { line: "听起来你卡在一件具体的事上了。", question: "先把它拆小：今天只动最容易的那一步，就够了。" },
  { line: "这件事确实让人犯难，我懂。", question: "试着写下两个选择，分别想象选完的明天——哪个更让你踏实？" },
  { line: "别一个人硬扛着想。", question: "先定个最小目标：今天先弄清一个最关键的点就好。" }
];

const PROBLEM_RE = /怎么办|怎么做|要不要|该不该|该怎么|如何|纠结|选哪|不知道(该|怎)|求助|帮我想|帮我看|\?|？/;

export function buildReflection(text: string): Reflection {
  const t = text ?? "";
  const { tone } = analyzeSentiment(t);
  if (PROBLEM_RE.test(t)) {
    const pick = PROBLEM_REPLIES[t.length % PROBLEM_REPLIES.length];
    return { line: pick.line, question: pick.question, tone };
  }
  const pool = REFLECTIONS[tone];
  const pick = pool[t.length % pool.length];
  return { line: pick.line, question: pick.question, tone };
}

/* ---------------- 长期记忆 / 主题（grounded, quotes） ---------------- */

const THEME_WORDS: { key: string; label: string; words: string[] }[] = [
  { key: "work", label: "工作", words: ["工作", "上班", "加班", "项目", "老板", "同事", "开会", "deadline", "ddl"] },
  { key: "sleep", label: "睡眠", words: ["睡", "失眠", "困", "熬夜", "睡不着", "做梦"] },
  { key: "family", label: "家人", words: ["爸", "妈", "父母", "家人", "家里", "奶奶", "爷爷", "孩子"] },
  { key: "tired", label: "累", words: ["累", "疲惫", "心累", "撑不住"] },
  { key: "money", label: "钱", words: ["钱", "工资", "存钱", "花钱", "穷", "发财", "房租"] },
  { key: "friend", label: "朋友", words: ["朋友", "聚", "吃饭", "约", "聊"] },
  { key: "love", label: "感情", words: ["喜欢", "爱", "他", "她", "分手", "暧昧", "想念"] },
  { key: "self", label: "自己", words: ["自己", "我想", "我要", "成长", "改变", "坚持"] }
];

export type Theme = { label: string; count: number; quote: string };

function quote(text: string, max = 22) {
  const t = (text || "").replace(/\n+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function buildThemes(records: StoredRecord[], top = 3): Theme[] {
  const out: { label: string; count: number; quote: string }[] = [];
  for (const theme of THEME_WORDS) {
    let count = 0;
    let firstHit: StoredRecord | null = null;
    for (const r of records) {
      if (theme.words.some((w) => r.content.includes(w))) {
        count += 1;
        if (!firstHit) firstHit = r;
      }
    }
    if (count >= 2 && firstHit) {
      out.push({ label: theme.label, count, quote: quote(firstHit.content) });
    }
  }
  return out.sort((a, b) => b.count - a.count).slice(0, top);
}

/* ---------------- LLM passthrough (optional, env-gated) ----------------
   Set AI_API_KEY (+ optional AI_BASE_URL, AI_MODEL) to upgrade copy.
   Works with any OpenAI-compatible endpoint (通义/豆包/Kimi/OpenAI…).
   Returns null when unconfigured or on error, so callers fall back. */

export async function callLLM(system: string, user: string): Promise<string | null> {
  const key = process.env.AI_API_KEY;
  if (!key) return null;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export function aiEnabled() {
  return Boolean(process.env.AI_API_KEY);
}
