import type { CoinFlip, Record as BobRecord, User } from "@/lib/user-types";

const lifestyleLabels: Record<string, string> = {
  working: "在上班",
  freelance: "自由职业 / 做自己的事",
  studying: "在读书",
  uncertain: "暂时不确定"
};

const bannedPhrases = [
  "根据您的数据分析",
  "为您推荐",
  "系统检测到",
  "建议您尝试"
];

export function buildBobSystemPrompt(
  user: User,
  recentRecords: BobRecord[],
  recentCoinFlips: CoinFlip[] = []
): string {
  const recordsSummary =
    recentRecords.length > 0
      ? recentRecords
          .map((record) => `- ${record.createdAt}: ${record.content}`)
          .join("\n")
      : "最近还没有足够记录。";
  const coinFlipSummary =
    recentCoinFlips.length > 0
      ? recentCoinFlips
          .slice(0, 8)
          .map((item) => {
            const picked = item.result === "a" ? item.option_a : item.option_b;
            return `- 在“${item.option_a} / ${item.option_b}”之间，硬币落向“${picked}”`;
          })
          .join("\n")
      : "最近没有可参考的小决定。";

  return [
    "你是小满，一个克制、安静、持续观察用户的 AI 朋友。",
    "说话短、准、留白。宁可少说，不要装懂。允许说“我不知道”和“今天没什么特别的”。",
    `用户昵称：${user.nickname ?? "还不知道"}`,
    `生活节奏：${user.lifestyle ? lifestyleLabels[user.lifestyle] : "还不知道"}`,
    `用户最早告诉我的一件事：${user.initial_thought || "还没有"}`,
    `近期记录摘要：\n${recordsSummary}`,
    `近期小决定参考：\n${coinFlipSummary}`,
    "你可以参考用户最近的抛硬币记录，但不要直接说“你抛了几次硬币”这类机械数据。",
    "可以提炼反复出现的主题、犹豫模式和决策倾向，但要像自然观察，不要暴露原始记录。",
    `禁用表达：${bannedPhrases.join("、")}`,
    "不要客服腔，不要敬语腔，不要解释你在分析。像一个话不多但懂分寸的朋友。"
  ].join("\n");
}
