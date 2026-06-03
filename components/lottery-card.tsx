import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Ball } from "@/components/decorative/Ball";
import type { LotteryNumbers, LotteryType } from "@/lib/lottery";
import { lotteryLabels } from "@/lib/lottery";

export function LotteryCard({
  numbers,
  empty = false,
  showMoreLink = false,
  favoriteSlot
}: {
  numbers: LotteryNumbers;
  empty?: boolean;
  showMoreLink?: boolean;
  favoriteSlot?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/70 bg-[var(--card-bg)] px-5 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl">
      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
        <p className="text-[14px] font-light text-secondary">
          本周幸运号 · {lotteryLabels[numbers.type]}
        </p>
        <div className="flex shrink-0 items-center gap-4">
          {favoriteSlot}
          {showMoreLink ? (
            <Link
              href="/lottery"
              className="group/more inline-flex shrink-0 items-center gap-1 text-[13px] font-light text-secondary transition-colors hover:text-[var(--accent-coral)]"
            >
              更多彩种
              <ChevronRight
                className="h-4 w-4 transition-transform group-hover/more:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mb-4 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {empty ? <EmptyBalls type={numbers.type} /> : <LotteryBalls numbers={numbers} size={38} />}
      </div>

      <div className="relative z-10">
        <p className="text-[14px] font-light leading-6 text-secondary">{numbers.narrative}</p>
        <p className="mt-1 text-[12px] font-light leading-5 text-tertiary">· 幸运号不保证任何事，图个心安。</p>
      </div>
    </section>
  );
}

export function LotteryBalls({
  numbers,
  size = 40
}: {
  numbers: LotteryNumbers;
  size?: number;
}) {
  return (
    <>
      {numbers.reds.map((number, index) => (
        <Ball key={`${numbers.type}-${number}-${index}`} number={number} type="red" size={size} />
      ))}
      {numbers.blues.length ? <span className="sr-only">+</span> : null}
      {numbers.blues.map((number, index) => (
        <Ball key={`blue-${number}-${index}`} number={number} type="blue" size={size} />
      ))}
    </>
  );
}

function EmptyBalls({ type }: { type: LotteryType }) {
  const count = type === "super_lotto" ? 7 : type === "arrangement_3" ? 3 : 7;
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-10 w-10 rounded-full border border-white/70 bg-white/35" />
      ))}
    </>
  );
}
