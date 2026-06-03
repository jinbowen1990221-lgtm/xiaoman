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
 * Curated, verifiable passages from Chinese & foreign literary works (novels /
 * prose — not poetry). Attribution is fixed and real — the model never invents
 * quotes; it only picks from this list and writes the connecting line.
 */
export const QUOTES: Quote[] = [
  { text: "人是为活着本身而活着的，而不是为了活着之外的任何事物所活着。", author: "余华", source: "《活着》", tones: ["heavy", "calm"], themes: ["自己", "累"] },
  { text: "围在城里的人想逃出来，城外的人想冲进去。对婚姻也罢，职业也罢，人生的愿望大都如此。", author: "钱钟书", source: "《围城》", tones: ["heavy"], themes: ["工作", "感情"] },
  { text: "希望本是无所谓有，无所谓无的。这正如地上的路；其实地上本没有路，走的人多了，也便成了路。", author: "鲁迅", source: "《故乡》", tones: ["spark", "heavy"], themes: ["自己"] },
  { text: "但是太阳，他每时每刻都是夕阳也都是旭日。当他熄灭着走下山去收尽苍凉残照之际，正是他在另一面燃烧着爬上山巅布散烈烈朝晖之时。", author: "史铁生", source: "《我与地坛》", tones: ["calm", "spark"], themes: ["自己"] },
  { text: "这个人也许永远不回来了，也许明天回来。", author: "沈从文", source: "《边城》", tones: ["heavy"], themes: ["感情", "朋友"] },
  { text: "那一天我二十一岁，在我一生的黄金时代。我有好多奢望。我想爱，想吃，还想在一瞬间变成天上半明半暗的云。", author: "王小波", source: "《黄金时代》", tones: ["spark", "warm"], themes: ["自己", "感情"] },
  { text: "我一个人，思念我们仨。", author: "杨绛", source: "《我们仨》", tones: ["heavy"], themes: ["家人"] },
  { text: "也许每一个男子全都有过这样的两个女人，至少两个。娶了红玫瑰，久而久之，红的变了墙上的一抹蚊子血，白的还是床前明月光。", author: "张爱玲", source: "《红玫瑰与白玫瑰》", tones: ["heavy"], themes: ["感情"] },
  { text: "一个人可以被毁灭，但不能被打败。", author: "海明威", source: "《老人与海》", tones: ["spark", "heavy"], themes: ["自己", "累", "工作"] },
  { text: "多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去看冰块的那个遥远的下午。", author: "加西亚·马尔克斯", source: "《百年孤独》", tones: ["calm"], themes: ["家人", "自己"] },
  { text: "于是我们奋力向前划，逆水行舟，却注定要不停地被浪潮推回到过去。", author: "菲茨杰拉德", source: "《了不起的盖茨比》", tones: ["heavy", "spark"], themes: ["自己"] },
  { text: "登上顶峰的斗争本身，足以充实一颗人心。应该认为，西西弗是幸福的。", author: "加缪", source: "《西西弗神话》", tones: ["spark", "heavy"], themes: ["工作", "累", "自己"] },
  { text: "正因为你为你的玫瑰花费了时间，这才使你的玫瑰变得如此重要。", author: "圣埃克苏佩里", source: "《小王子》", tones: ["warm"], themes: ["感情", "自己"] },
  { text: "当你穿过了暴风雨，你就不再是原来那个走进暴风雨的人。这就是这场暴风雨的意义。", author: "村上春树", source: "《海边的卡夫卡》", tones: ["heavy", "spark"], themes: ["自己", "累"] },
  { text: "世界上只有一种真正的英雄主义，那就是在认清生活的真相之后，依然热爱生活。", author: "罗曼·罗兰", source: "《米开朗琪罗传》", tones: ["heavy", "spark"], themes: ["自己", "累"] },
  { text: "凡是有钱的单身汉，总想娶位太太，这已经成了一条举世公认的真理。", author: "简·奥斯汀", source: "《傲慢与偏见》", tones: ["calm", "warm"], themes: ["感情", "钱"] },
  { text: "你以为，因为我穷、低微、不美、矮小，我就没有灵魂没有心吗？你想错了——我的心灵跟你一样丰富，我的胸怀跟你一样充实。", author: "夏洛蒂·勃朗特", source: "《简·爱》", tones: ["spark", "heavy"], themes: ["自己", "感情"] },
  { text: "幸福的家庭都是相似的，不幸的家庭各有各的不幸。", author: "列夫·托尔斯泰", source: "《安娜·卡列尼娜》", tones: ["heavy", "calm"], themes: ["家人"] },
  { text: "这是最好的时代，也是最坏的时代；这是智慧的时代，也是愚蠢的时代。", author: "狄更斯", source: "《双城记》", tones: ["heavy", "spark"], themes: ["自己", "工作"] },
  { text: "鸟要奋力冲破蛋壳。这枚蛋就是世界。谁要诞生，就得先摧毁一个世界。", author: "赫尔曼·黑塞", source: "《德米安》", tones: ["spark", "heavy"], themes: ["自己"] },
  { text: "一天早晨，格里高尔·萨姆沙从不安的睡梦中醒来，发现自己躺在床上变成了一只巨大的甲虫。", author: "卡夫卡", source: "《变形记》", tones: ["heavy"], themes: ["工作", "累", "自己"] },
  { text: "负担越重，我们的生命越贴近大地，它就越真切实在。", author: "米兰·昆德拉", source: "《不能承受的生命之轻》", tones: ["heavy", "calm"], themes: ["自己", "累"] },
  { text: "在那个充满预兆与星辰的夜里，我第一次向这世界温柔的冷漠敞开了自己的心扉。", author: "加缪", source: "《局外人》", tones: ["calm", "heavy"], themes: ["自己"] },
  { text: "我整整一分钟都是幸福的。难道一个人一生哪怕只有一分钟的幸福，也还嫌不够吗？", author: "陀思妥耶夫斯基", source: "《白夜》", tones: ["warm", "heavy"], themes: ["感情", "自己"] },
  { text: "女人若想写小说，必须有钱，再加一间属于自己的房间。", author: "弗吉尼亚·伍尔夫", source: "《一间自己的房间》", tones: ["spark", "calm"], themes: ["自己", "工作", "钱"] },
  { text: "我一直暗自设想，天堂应该是图书馆的模样。", author: "博尔赫斯", source: "《关于天赐的诗》", tones: ["calm", "warm"], themes: ["自己"] },
  { text: "为了使灵魂宁静，一个人每天至少要做两件他不喜欢的事。", author: "毛姆", source: "《月亮与六便士》", tones: ["calm", "spark"], themes: ["自己"] },
  { text: "人的一切都应该是美的：面貌、衣裳、心灵和思想。", author: "契诃夫", source: "《万尼亚舅舅》", tones: ["warm", "calm"], themes: ["自己"] },
  { text: "她那时候还太年轻，不知道所有命运赠送的礼物，早已在暗中标好了价格。", author: "茨威格", source: "《断头王后》", tones: ["heavy", "calm"], themes: ["自己", "钱"] },
  { text: "我什么也不会，我只会思考、等待和斋戒。", author: "赫尔曼·黑塞", source: "《悉达多》", tones: ["calm", "spark"], themes: ["自己", "工作"] },
  { text: "那些杀不死我的，使我更强大。", author: "尼采", source: "《偶像的黄昏》", tones: ["spark", "heavy"], themes: ["累", "自己"] },
  { text: "美的事物，对如今的我而言，已经成了怨敌。", author: "三岛由纪夫", source: "《金阁寺》", tones: ["heavy"], themes: ["自己", "感情"] },
  { text: "凌晨四点醒来，发现海棠花未眠。", author: "川端康成", source: "《花未眠》", tones: ["calm", "warm"], themes: ["自己", "睡眠"] },
  { text: "死并非生的对立面，而是作为生的一部分永存。", author: "村上春树", source: "《挪威的森林》", tones: ["heavy", "calm"], themes: ["自己"] },
  { text: "女性主义，绝不是弱者想变成强者的思想，而是追求弱者也能得到尊重的思想。", author: "上野千鹤子", source: "东京大学入学致辞", tones: ["spark"], themes: ["自己", "工作"] }
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
  return `${lead[tone] ?? lead.calm}在另一本书里，${quote.author}也写下过相似的心境——也许此刻，它正好说中了你。`;
}
