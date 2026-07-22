"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LotteryBalls } from "@/components/lottery-card";
import { lotteryLabels, type LotteryNumbers, type LotteryType } from "@/lib/lottery";

export function LotterySelector({
  numbers,
  preferredLottery,
  requiresBirthday
}: {
  numbers: Record<LotteryType, LotteryNumbers>;
  preferredLottery: LotteryType;
  requiresBirthday: boolean;
}) {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<LotteryType | null>(null);
  const [saveError, setSaveError] = useState("");

  async function chooseLottery(type: LotteryType) {
    if (requiresBirthday) {
      router.push("/me/birthday");
      return;
    }

    setPendingType(type);
    setSaveError("");
    try {
      const response = await fetch("/api/user/preferred-lottery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_lottery: type })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "暂时没存好，请稍后再试");
      router.push("/");
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "暂时没存好，请稍后再试");
    } finally {
      setPendingType(null);
    }
  }

  return (
    <div className="space-y-4">
      {saveError ? (
        <p role="alert" className="text-center text-[13px] text-[var(--accent-coral)]">
          {saveError}
        </p>
      ) : null}
      {(["double_color", "super_lotto", "arrangement_3"] as LotteryType[]).map((type) => {
        const active = type === preferredLottery;
        return (
          <button
            type="button"
            key={type}
            onClick={() => chooseLottery(type)}
            disabled={pendingType !== null}
            className={`w-full overflow-hidden rounded-[22px] border bg-[var(--card-bg)] px-5 py-5 text-left shadow-[var(--card-shadow)] backdrop-blur-xl transition duration-200 active:scale-[0.99] ${
              active
                ? "border-[rgba(199,93,62,0.45)] ring-1 ring-[rgba(199,93,62,0.30)]"
                : "border-white/70"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-[18px] font-medium text-primary">{lotteryLabels[type]}</h2>
              {active ? (
                <span className="font-garamond text-[11px] uppercase tracking-[0.18em] text-[var(--accent-coral)]">current</span>
              ) : null}
            </div>
            <div className="mt-4 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <LotteryBalls numbers={numbers[type]} size={36} />
            </div>
            <p className="mt-4 text-[13px] font-light leading-6 text-secondary">{numbers[type].narrative}</p>
            <p className="mt-1 text-[11px] font-light text-tertiary">· 幸运号不保证任何事，图个心安。</p>
          </button>
        );
      })}
    </div>
  );
}
