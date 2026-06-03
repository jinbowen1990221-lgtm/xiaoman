"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { LotteryBalls } from "@/components/lottery-card";
import { beijingParts } from "@/lib/date";
import { lotteryLabels, type LotteryType } from "@/lib/lottery";

type Fav = {
  id: string;
  type: LotteryType;
  reds: number[];
  blues: number[];
  narrative: string;
  created_at: string;
};

export function LotteryFavoritesList({ initial }: { initial: Fav[] }) {
  const [list, setList] = useState(initial);

  async function remove(id: string) {
    setList((l) => l.filter((f) => f.id !== id));
    try {
      await fetch("/api/lottery-favorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch {
      // ignore
    }
  }

  if (list.length === 0) return null;

  return (
    <section className="mt-9">
      <p className="eyebrow pl-1">SAVED · 我收藏的号码</p>
      <div className="mt-3 space-y-3">
        {list.map((f) => {
          const p = beijingParts(f.created_at);
          return (
            <div
              key={f.id}
              className="relative overflow-hidden rounded-[20px] border border-white/70 bg-[var(--card-bg)] px-5 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => void remove(f.id)}
                aria-label="删除收藏"
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/5 text-tertiary"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <div className="flex items-baseline gap-2">
                <h3 className="font-serif text-[16px] font-medium text-primary">
                  {lotteryLabels[f.type]}
                </h3>
                <span className="font-garamond text-[11px] italic text-tertiary">
                  {p.month} 月 {p.day} 日 收藏
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <LotteryBalls numbers={{ type: f.type, reds: f.reds, blues: f.blues, narrative: f.narrative }} size={34} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
