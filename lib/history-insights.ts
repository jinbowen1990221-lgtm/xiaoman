import { historyInsights } from "@/lib/mock-data";
import type { CoinFlip } from "@/lib/user-types";

export function buildHistoryInsights(recentCoinFlips: CoinFlip[]) {
  const dynamicInsight = buildCoinFlipInsight(recentCoinFlips);
  return {
    ...historyInsights,
    insights: dynamicInsight
      ? [dynamicInsight, ...historyInsights.insights]
      : historyInsights.insights
  };
}

function buildCoinFlipInsight(recentCoinFlips: CoinFlip[]) {
  if (recentCoinFlips.length < 3) return null;

  const counter = new Map<string, number>();
  for (const item of recentCoinFlips) {
    const theme = normalizeTheme(item.option_a, item.option_b);
    if (!theme) continue;
    counter.set(theme, (counter.get(theme) ?? 0) + 1);
  }

  const top = Array.from(counter.entries()).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 3) return null;

  return {
    title: "一件反复出现的事",
    detail: `你这周 ${top[1]} 次在想“${top[0]}”。也许答案已经在心里了。`,
    hook: "要聊聊吗？"
  };
}

function normalizeTheme(optionA: string, optionB: string) {
  const joined = `${optionA} ${optionB}`;
  const match = joined.match(/联系他|联系她|联系|辞职|工作|休息|去|不去|见面/);
  if (match) return match[0];
  return optionA.slice(0, 12) || optionB.slice(0, 12);
}
