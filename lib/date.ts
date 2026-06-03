const solarTerms: Record<string, string> = {
  "01-06": "小寒",
  "01-20": "大寒",
  "02-04": "立春",
  "02-19": "雨水",
  "03-05": "惊蛰",
  "03-20": "春分",
  "04-04": "清明",
  "04-20": "谷雨",
  "05-05": "立夏",
  "05-21": "小满",
  "06-05": "芒种",
  "06-21": "夏至",
  "07-07": "小暑",
  "07-22": "大暑",
  "08-07": "立秋",
  "08-23": "处暑",
  "09-07": "白露",
  "09-23": "秋分",
  "10-08": "寒露",
  "10-23": "霜降",
  "11-07": "立冬",
  "11-22": "小雪",
  "12-07": "大雪",
  "12-22": "冬至"
};

export function getGreeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Shanghai"
    }).format(date)
  );

  if (hour >= 18) return "晚上好";
  if (hour >= 12) return "下午好";
  if (hour >= 6) return "上午好";
  return "早上好";
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

/**
 * Extract date/time parts of an instant in Beijing time. Records are stored as
 * UTC ISO strings; using Date.getHours()/getDate() reads them in the runtime's
 * timezone (UTC on Vercel), which made a 9am-Beijing entry show as "深夜".
 */
export function beijingParts(input: Date | string) {
  const d = typeof input === "string" ? new Date(input) : input;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    weekday: "short"
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")) % 24,
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0
  };
}

/** Beijing-day key like "2026-06-03", for "same day?" comparisons. */
export function beijingDay(input: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(
    typeof input === "string" ? new Date(input) : input
  );
}

export function timeOfDay(date = new Date()) {
  const hour =
    Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Shanghai"
      }).format(date)
    ) % 24;

  if (hour < 5) return "凌晨";
  if (hour < 12) return "上午";
  if (hour < 18) return "下午";
  return "晚上";
}

export function formatChineseDate(date = new Date()) {
  const formatted = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Shanghai"
  }).format(date);

  return `${formatted} · ${getSolarTerm(date)}`;
}

export function getSolarTerm(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai"
  }).formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value ?? "04";
  const day = parts.find((part) => part.type === "day")?.value ?? "20";
  return solarTerms[`${month}-${day}`] ?? "今日";
}

export function getIsoWeek(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function shortDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Shanghai"
  }).format(date);
}
