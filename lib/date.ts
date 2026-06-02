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
