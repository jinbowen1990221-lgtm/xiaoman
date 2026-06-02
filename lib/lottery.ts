import { getIsoWeek } from "@/lib/date";
import type { PreferredLottery } from "@/lib/user-types";

export type LotteryType = PreferredLottery;

export interface LotteryNumbers {
  type: LotteryType;
  reds: number[];
  blues: number[];
  narrative: string;
}

export const lotteryLabels: Record<LotteryType, string> = {
  double_color: "双色球",
  super_lotto: "大乐透",
  arrangement_3: "排列三"
};

const narrativeTemplates: Record<LotteryType, string[]> = {
  double_color: [
    "挑了些带你生日尾数 {lastDigit} 的数字",
    "你这周常说到“{keyword}”，放进去了。",
    "一组{adjective}的数字。陪你一周。",
    "把生日里的 {lastDigit} 留在里面，顺手也放了点{mood}。",
    "这周偏{mood}，数字也挑得轻一点。"
  ],
  super_lotto: [
    "你这周常说到“{keyword}”，放进去了。",
    "挑了些带你生日尾数 {lastDigit} 的数字",
    "前面稳一点，后面留一点小变化。",
    "一组{adjective}的数字。陪你一周。",
    "今天先把这些数字放在口袋里。"
  ],
  arrangement_3: [
    "一组{adjective}的数字。陪你一周。",
    "把生日尾数 {lastDigit} 放进去，其他两个就顺一点。",
    "这周偏{mood}，三位数也挑得简单。",
    "你常说到“{keyword}”，就把它放进去了。",
    "一组简单的数字。陪你一周。"
  ]
};

const moods = ["暖", "静", "轻", "慢", "动"];
const keywords = ["等待", "工作", "睡眠", "联系", "周末"];
const adjectives = ["简单", "安静", "偏暖", "不绕弯", "松一点"];

export function generateLotteryNumbers(
  userBirthday: string,
  userId: string,
  type: LotteryType,
  weekNumber = getIsoWeek(new Date())
): LotteryNumbers {
  const birthdayDigits = userBirthday.replace(/\D/g, "");
  const seed = hashSeed(`${birthdayDigits}-${weekNumber}-${type}-${userId}`);
  const random = mulberry32(seed);

  if (type === "super_lotto") {
    return {
      type,
      reds: uniqueNumbers(random, 5, 35, 1).sort((a, b) => a - b),
      blues: uniqueNumbers(random, 2, 12, 1).sort((a, b) => a - b),
      narrative: buildNarrative(type, userBirthday, seed)
    };
  }

  if (type === "arrangement_3") {
    return {
      type,
      reds: Array.from({ length: 3 }, () => Math.floor(random() * 10)),
      blues: [],
      narrative: buildNarrative(type, userBirthday, seed)
    };
  }

  return {
    type,
    reds: uniqueNumbers(random, 6, 33, 1).sort((a, b) => a - b),
    blues: [Math.floor(random() * 16) + 1],
    narrative: buildNarrative(type, userBirthday, seed)
  };
}

export function generateAllLotteryNumbers(
  userBirthday: string,
  userId: string,
  weekNumber = getIsoWeek(new Date())
) {
  return {
    double_color: generateLotteryNumbers(userBirthday, userId, "double_color", weekNumber),
    super_lotto: generateLotteryNumbers(userBirthday, userId, "super_lotto", weekNumber),
    arrangement_3: generateLotteryNumbers(userBirthday, userId, "arrangement_3", weekNumber)
  };
}

export function emptyLotteryNumbers(type: LotteryType): LotteryNumbers {
  return {
    type,
    reds: [],
    blues: [],
    narrative: "填上生日，我来给你挑一组 →"
  };
}

function buildNarrative(type: LotteryType, birthday: string, seed: number) {
  const templates = narrativeTemplates[type];
  const template = templates[seed % templates.length];
  const lastDigit = birthday.replace(/\D/g, "").at(-1) ?? "1";

  return template
    .replace("{lastDigit}", lastDigit)
    .replace("{mood}", pick(moods, seed))
    .replace("{keyword}", pick(keywords, seed >>> 2))
    .replace("{adjective}", pick(adjectives, seed >>> 6))
    .replace("{style}", "稳")
    .replace("{count}", String((seed % 3) + 2))
    .replace("{suggestion}", "陪你一周");
}

function pick(values: string[], seed: number) {
  return values[seed % values.length];
}

function uniqueNumbers(
  random: () => number,
  count: number,
  max: number,
  min: number
) {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(random() * (max - min + 1)) + min);
  }
  return Array.from(numbers);
}

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
