"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const FILTERS = [
  {
    key: "week",
    label: "这一周",
    summary: "提到了 4 次\"烦\"，3 次工作相关。周三状态最好，那天你和朋友吃了火锅。",
    intro: "这周"
  },
  {
    key: "month",
    label: "这个月",
    summary: "你比上个月多记了 12 天。\"想休息\"出现过 7 次，但你每次都把活做完了。",
    intro: "这一个月"
  },
  {
    key: "quarter",
    label: "三个月",
    summary: "你提到\"家人\"的次数翻了一倍。三月那场雨，你写了三遍。",
    intro: "这三个月"
  },
  {
    key: "all",
    label: "全部",
    summary: "陪伴你 18 天 · 收下 42 件事。你最常出现的一句话是\"算了，明天再说\"。",
    intro: "一直以来"
  }
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export function HistoryFilters({ initialSummary }: { initialSummary: string }) {
  const [active, setActive] = useState<FilterKey>("week");
  const current = FILTERS.find((f) => f.key === active) ?? FILTERS[0];
  const summary = active === "week" ? initialSummary : current.summary;

  return (
    <div>
      <p className="mt-3 font-garamond text-[15px] italic leading-7 text-secondary">
        这是<span className="not-italic text-[var(--accent-coral)]"> {current.intro} </span>我看到的你 ——
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((filter) => {
          const isActive = filter.key === active;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActive(filter.key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-[12px] transition-colors ${
                isActive
                  ? "text-white"
                  : "border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary backdrop-blur-xl hover:scale-[1.03]"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="history-filter-pill"
                  className="absolute inset-0 rounded-full bg-[var(--btn-dark)] shadow-[0_6px_14px_rgba(42,37,32,0.16)]"
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                />
              ) : null}
              <span className="relative">{filter.label}</span>
            </button>
          );
        })}
      </div>

      <motion.section
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative mt-5 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] px-5 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl"
      >
        <div className="relative mb-3 flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-coral)] text-[12px] font-medium text-white shadow-[0_4px_10px_rgba(199,93,62,0.28)]">
            满
          </div>
          <span className="font-garamond text-[12px] uppercase tracking-[0.18em] text-secondary">
            {current.key === "week"
              ? "this week · 这一周你"
              : current.key === "month"
                ? "this month · 这一个月你"
                : current.key === "quarter"
                  ? "past 3 months · 三个月里"
                  : "all time · 一直以来"}
          </span>
        </div>
        <p className="relative text-[15px] font-light leading-[1.75] text-primary">{summary}</p>
      </motion.section>
    </div>
  );
}
