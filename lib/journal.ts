import type { StoredRecord } from "@/lib/user-types";

export type DisplayRecord = {
  id: string;
  date: string; // "6 月 1 日"
  weekday: string; // "周一"
  timeOfDay: string; // 上午/下午/晚上/深夜
  month: number;
  day: number;
  count: string;
  preview: string;
  text: string;
  inputType: "text" | "voice";
  images: string[];
  audioDuration?: number;
};

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function timeOfDay(hour: number) {
  if (hour < 6) return "深夜";
  if (hour < 12) return "上午";
  if (hour < 18) return "下午";
  return "晚上";
}

export function toDisplayRecord(r: StoredRecord): DisplayRecord {
  const d = new Date(r.created_at);
  const text = r.content.trim();
  const firstLine = text.split("\n").find((line) => line.trim()) ?? text;
  const preview = firstLine.length > 22 ? `${firstLine.slice(0, 22)}…` : firstLine;

  let count: string;
  if (r.input_type === "voice") {
    count = r.audio_duration ? `1 条语音 · ${r.audio_duration} 秒` : "1 条语音";
  } else {
    count = "1 条记录";
  }
  if (r.images.length > 0) count += ` · ${r.images.length} 张图`;

  return {
    id: r.id,
    date: `${d.getMonth() + 1} 月 ${d.getDate()} 日`,
    weekday: WEEKDAYS[d.getDay()],
    timeOfDay: timeOfDay(d.getHours()),
    month: d.getMonth() + 1,
    day: d.getDate(),
    count,
    preview: preview || "（没写文字）",
    text: text || "（这条没有文字）",
    inputType: r.input_type,
    images: r.images,
    audioDuration: r.audio_duration ?? undefined
  };
}

/* ---- grounded "小满看见的" — always quotes the user's own words ---- */

export type Observation = { title: string; detail: string; hook: string };

function quote(text: string, max = 18) {
  const t = text.replace(/\n+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function buildSummary(records: StoredRecord[]): string | null {
  if (records.length === 0) return null;
  const latest = records[0];
  const n = records.length;
  return `这一周你记了 ${n} 次。最近一次，你说：“${quote(latest.content, 24)}”`;
}

export function buildObservations(records: StoredRecord[]): Observation[] {
  if (records.length === 0) return [];
  const out: Observation[] = [];
  const latest = records[0];

  // 1) always echo their latest words — being seen
  out.push({
    title: "我记下了你最近说的",
    detail: `“${quote(latest.content, 40)}”`,
    hook: "我放在心上了。"
  });

  // 2) time-of-day pattern (grounded in created_at)
  const lateNight = records.filter((r) => {
    const h = new Date(r.created_at).getHours();
    return h >= 23 || h < 5;
  }).length;
  if (lateNight >= 2) {
    out.push({
      title: "你常在深夜记录",
      detail: `这几次里有 ${lateNight} 次是夜里写的。不是问题，只是提醒——很晚还想说，写一句最短的也行。`,
      hook: "一句也算。"
    });
  }

  // 3) short-message pattern
  const shortOnes = records.filter((r) => r.content.trim().length > 0 && r.content.trim().length <= 12).length;
  if (shortOnes >= 2) {
    out.push({
      title: "你最近把话收得很短",
      detail: "有几次你只写了一句就停下了。你可能不是没想清楚，只是不想把它说重。",
      hook: "要聊聊吗？"
    });
  }

  // 4) voice usage
  const voice = records.filter((r) => r.input_type === "voice").length;
  if (voice >= 1) {
    out.push({
      title: "你愿意说给我听",
      detail: `你有 ${voice} 次是说出来的，不是打出来的。说出口的那一刻，常常已经轻了一点。`,
      hook: "我在听。"
    });
  }

  return out.slice(0, 3);
}
