import { analyzeSentiment, buildThemes } from "@/lib/ai";
import type { StoredRecord } from "@/lib/user-types";

export type Quote = {
  text: string;
  author: string;
  source: string;
  tones: string[]; // heavy / warm / spark / calm
  themes: string[]; // matches buildThemes labels: 工作/睡眠/家人/累/钱/朋友/感情/自己
};

/**
 * Curated, verifiable literary lines (classic Chinese poetry + well-known works).
 * Attribution is fixed and real — the model never invents quotes, it only
 * picks from this list and writes the connecting line.
 */
export const QUOTES: Quote[] = [
  { text: "人生如逆旅，我亦是行人。", author: "苏轼", source: "《临江仙·送钱穆父》", tones: ["heavy", "calm"], themes: ["自己"] },
  { text: "长风破浪会有时，直挂云帆济沧海。", author: "李白", source: "《行路难·其一》", tones: ["spark"], themes: ["工作", "自己"] },
  { text: "千磨万击还坚劲，任尔东西南北风。", author: "郑燮", source: "《竹石》", tones: ["heavy"], themes: ["累", "工作"] },
  { text: "山重水复疑无路，柳暗花明又一村。", author: "陆游", source: "《游山西村》", tones: ["heavy", "spark"], themes: ["工作"] },
  { text: "沉舟侧畔千帆过，病树前头万木春。", author: "刘禹锡", source: "《酬乐天扬州初逢席上见赠》", tones: ["heavy"], themes: ["自己"] },
  { text: "莫愁前路无知己，天下谁人不识君。", author: "高适", source: "《别董大》", tones: ["heavy"], themes: ["朋友"] },
  { text: "采菊东篱下，悠然见南山。", author: "陶渊明", source: "《饮酒·其五》", tones: ["calm", "warm"], themes: ["自己"] },
  { text: "此心安处是吾乡。", author: "苏轼", source: "《定风波·南海归赠王定国侍人寓娘》", tones: ["calm", "warm"], themes: ["家人", "自己"] },
  { text: "一蓑烟雨任平生。", author: "苏轼", source: "《定风波·莫听穿林打叶声》", tones: ["calm", "heavy"], themes: ["自己"] },
  { text: "晚来天欲雪，能饮一杯无？", author: "白居易", source: "《问刘十九》", tones: ["warm", "calm"], themes: ["朋友"] },
  { text: "今夜月明人尽望，不知秋思落谁家。", author: "王建", source: "《十五夜望月寄杜郎中》", tones: ["heavy"], themes: ["感情", "家人"] },
  { text: "此情可待成追忆，只是当时已惘然。", author: "李商隐", source: "《锦瑟》", tones: ["heavy"], themes: ["感情"] },
  { text: "人生若只如初见，何事秋风悲画扇。", author: "纳兰性德", source: "《木兰花·拟古决绝词柬友》", tones: ["heavy"], themes: ["感情"] },
  { text: "曾经沧海难为水，除却巫山不是云。", author: "元稹", source: "《离思五首·其四》", tones: ["heavy"], themes: ["感情"] },
  { text: "愿得一心人，白头不相离。", author: "卓文君", source: "《白头吟》", tones: ["warm"], themes: ["感情"] },
  { text: "逝者如斯夫，不舍昼夜。", author: "孔子", source: "《论语·子罕》", tones: ["calm"], themes: ["自己"] },
  { text: "盛年不重来，一日难再晨。", author: "陶渊明", source: "《杂诗·其一》", tones: ["spark"], themes: ["自己"] },
  { text: "天行健，君子以自强不息。", author: "佚名", source: "《周易·乾卦》", tones: ["spark", "heavy"], themes: ["工作", "自己"] },
  { text: "天生我材必有用，千金散尽还复来。", author: "李白", source: "《将进酒》", tones: ["spark"], themes: ["钱", "自己"] },
  { text: "仰天大笑出门去，我辈岂是蓬蒿人。", author: "李白", source: "《南陵别儿童入京》", tones: ["spark"], themes: ["自己"] },
  { text: "黑夜给了我黑色的眼睛，我却用它寻找光明。", author: "顾城", source: "《一代人》", tones: ["heavy", "spark"], themes: ["自己"] },
  { text: "世界以痛吻我，要我报之以歌。", author: "泰戈尔", source: "《飞鸟集》", tones: ["heavy", "warm"], themes: ["自己"] },
  { text: "我们都生活在阴沟里，但仍有人仰望星空。", author: "奥斯卡·王尔德", source: "《温德米尔夫人的扇子》", tones: ["heavy", "spark"], themes: ["自己"] },
  { text: "海内存知己，天涯若比邻。", author: "王勃", source: "《送杜少府之任蜀州》", tones: ["warm"], themes: ["朋友"] },
  { text: "但愿人长久，千里共婵娟。", author: "苏轼", source: "《水调歌头·明月几时有》", tones: ["warm", "heavy"], themes: ["家人", "感情"] },
  { text: "莫等闲，白了少年头，空悲切。", author: "岳飞", source: "《满江红·写怀》", tones: ["spark"], themes: ["工作", "自己"] },
  { text: "不畏浮云遮望眼，自缘身在最高层。", author: "王安石", source: "《登飞来峰》", tones: ["spark"], themes: ["工作", "自己"] },
  { text: "衣带渐宽终不悔，为伊消得人憔悴。", author: "柳永", source: "《蝶恋花·伫倚危楼风细细》", tones: ["heavy"], themes: ["感情", "工作"] }
];

/** Pick the most resonant quote for the user's recent diary (deterministic per seed). */
export function selectQuote(records: StoredRecord[], seed = dayseed()): Quote {
  const recentText = records.slice(0, 5).map((r) => r.content).join("。");
  const tone = analyzeSentiment(recentText).tone;
  const themeLabels = new Set(buildThemes(records, 3).map((t) => t.label));

  let best = -1;
  const scored = QUOTES.map((q) => {
    const themeHit = q.themes.some((t) => themeLabels.has(t)) ? 2 : 0;
    const toneHit = q.tones.includes(tone) ? 1 : 0;
    const score = themeHit + toneHit;
    if (score > best) best = score;
    return { q, score };
  });
  const top = scored.filter((s) => s.score === best).map((s) => s.q);
  return top[seed % top.length];
}

function dayseed() {
  // stable within a Beijing day, varies day to day
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
  return d.split("-").reduce((acc, n) => acc + Number(n), 0);
}

/** Prompt for the connecting reflection — model must NOT invent any quote. */
export function readingPrompt(records: StoredRecord[], quote: Quote) {
  const recent = records.slice(0, 8).map((r) => `- ${r.content.replace(/\n+/g, " ").trim()}`).join("\n");
  const system = [
    "你是小满，一个克制、温柔、有文学感的 AI 朋友。",
    "下面给你：用户今天/最近写的记录，以及一句【已选定的、真实的】名句。",
    "请写一小段『今日解读』：先用一两句话提炼 ta 今天的心境，再自然地点出这句名句为什么和此刻的 ta 相呼应。",
    "严格要求：",
    "1) 绝对不要引用或编造除这句之外的任何诗句/名言；不要改写这句名句本身；",
    "2) 不评判、不说教、不喊口号；温柔、有留白；",
    "3) 三到四句以内，不要加称呼、不要解释你在做什么。",
    `这句名句：「${quote.text}」——${quote.author}${quote.source}`,
    `ta 最近写的：\n${recent || "（暂无）"}`
  ].join("\n");
  const user = "请只输出那段今日解读。";
  return { system, user };
}

export function buildReadingFallback(records: StoredRecord[], quote: Quote): string {
  const tone = analyzeSentiment(records.slice(0, 5).map((r) => r.content).join("。")).tone;
  const lead: Record<string, string> = {
    heavy: "今天的你，心里好像沉沉的。",
    warm: "今天的你，藏着一点暖。",
    spark: "今天的你，心里有一点光。",
    calm: "今天的你，平平静静的。"
  };
  return `${lead[tone] ?? lead.calm}很多年前，${quote.author}也写下过相似的心境——也许此刻，它正好说中了你。`;
}
