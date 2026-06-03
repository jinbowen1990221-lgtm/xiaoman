"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import type { LotteryNumbers } from "@/lib/lottery";

export function LotteryFavoriteButton({ numbers }: { numbers: LotteryNumbers }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy || saved) return;
    setBusy(true);
    try {
      const r = await fetch("/api/lottery-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: numbers.type,
          reds: numbers.reds,
          blues: numbers.blues,
          narrative: numbers.narrative
        })
      });
      if (r.ok) setSaved(true);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={busy || saved}
      aria-label="收藏这组号码"
      className="inline-flex shrink-0 items-center gap-1 text-[13px] font-light text-secondary transition-colors active:scale-95"
    >
      <Heart
        className={`h-4 w-4 ${saved ? "fill-[var(--accent-coral)] text-[var(--accent-coral)]" : "text-secondary"}`}
        strokeWidth={1.6}
      />
      {saved ? "已收藏" : "收藏"}
    </button>
  );
}
