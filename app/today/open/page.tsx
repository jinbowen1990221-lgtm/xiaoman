"use client";

import { Check, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopNav } from "@/components/top-nav";
import { openTodayOptions } from "@/lib/mock-data";
import { useBobStore } from "@/store/bob-store";

export default function OpenTodayPage() {
  const router = useRouter();
  const setSelectedWord = useBobStore((state) => state.setSelectedWord);
  const [selected, setSelected] = useState(openTodayOptions[1].zh);

  function submit() {
    if (!selected) return;
    setSelectedWord(selected);
    router.push(`/today/note?choice=${encodeURIComponent(selected)}`);
  }

  return (
    <div className="stagger-in secondary-page-pad relative z-10 min-h-dvh pb-12">
      <TopNav title="翻开今天" subtitle="step 1/2" />

      <header className="mt-2">
        <span className="postmark">
          <Heart className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]" strokeWidth={1.2} />
          翻开今天 · step 1/2
        </span>
        <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-primary">
          此刻，<span className="ink-underline">你最想听到</span>哪个词？
        </h1>
        <p className="mt-2 font-garamond text-[14px] italic text-secondary">
          choose what resonates with you
        </p>
        <p className="mt-3 text-[13px] font-light leading-6 text-secondary">
          不用想太久，<span className="text-[var(--accent-deep)]">第一眼</span>停下来的那个，就是此刻的答案。
        </p>
      </header>

      <div className="mt-7 space-y-3">
        {openTodayOptions.map((option, index) => {
          const active = selected === option.zh;
          return (
            <button
              type="button"
              key={option.zh}
              onClick={() => setSelected(option.zh)}
              aria-pressed={active}
              className={`group relative w-full overflow-hidden rounded-[18px] border bg-[var(--card-bg)] p-5 text-left shadow-[var(--card-shadow)] backdrop-blur-xl transition-all duration-200 active:scale-[0.99] ${
                active
                  ? "border-[rgba(199,93,62,0.40)] ring-1 ring-[rgba(199,93,62,0.18)] shadow-[0_8px_24px_rgba(199,93,62,0.14)]"
                  : "border-white/70 hover:scale-[1.01]"
              }`}
            >
              <span className="font-garamond text-[11px] italic text-tertiary">no. 0{index + 1}</span>
              <div className="mt-1 pr-10 font-serif text-[19px] font-medium text-primary">
                {option.zh}
                <span className="mx-2 text-tertiary">·</span>
                <span className="font-garamond italic text-[var(--accent-deep)]">{option.en}</span>
              </div>
              <p className="mt-2 text-[13px] font-light leading-6 text-secondary">
                {option.subtitle}
              </p>
              {active ? (
                <span className="absolute right-5 top-5 grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-coral)] text-white shadow-[0_4px_10px_rgba(199,93,62,0.32)]">
                  <Check size={14} strokeWidth={2.2} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center font-garamond text-[12px] italic text-tertiary">
        — 小满会用你选的这个词，写下今天 —
      </p>

      <div className="sticky bottom-5 mt-7">
        <button
          type="button"
          disabled={!selected}
          onClick={submit}
          className="bob-button-dark w-full disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-2">
            生成今日预感
            <span aria-hidden="true" className="font-garamond text-[12px] italic opacity-70">→</span>
          </span>
        </button>
      </div>
    </div>
  );
}
