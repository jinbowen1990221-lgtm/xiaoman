"use client";

import { ChevronRight, Home } from "lucide-react";

export function CompanionCard() {
  function open() {
    window.dispatchEvent(new CustomEvent("xiaoman:show-install"));
  }

  return (
    <button
      type="button"
      onClick={open}
      className="relative mx-6 mt-[26px] flex w-[calc(100%-3rem)] items-center gap-4 overflow-hidden rounded-[22px] border border-[rgba(199,93,62,0.22)] bg-[rgba(255,247,238,0.7)] px-5 py-4 text-left shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform active:scale-[0.99]"
    >
      <div className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[14px] bg-[var(--accent-coral)] text-white shadow-[0_6px_14px_rgba(199,93,62,0.28)]">
        <Home className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-[16px] font-medium text-primary">让小满一直陪伴你</h2>
        <p className="mt-0.5 text-[12px] font-light leading-5 text-secondary">
          添加到主屏幕，像 App 一样打开 · 看怎么做
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[var(--accent-coral)]" strokeWidth={1.6} />
    </button>
  );
}
