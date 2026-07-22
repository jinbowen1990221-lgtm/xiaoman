"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { WheelColumn } from "@/components/onboarding/wheel-column";
import { saveOnboarding } from "@/lib/onboarding-client";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingRemindPage() {
  const router = useRouter();
  const remindTime = useOnboardingStore((state) => state.remindTime);
  const remindEnabled = useOnboardingStore((state) => state.remindEnabled);
  const setField = useOnboardingStore((state) => state.setField);
  const [hour, minute] = remindTime.split(":").map(Number);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, index) => index), []);

  function setTime(nextHour: number, nextMinute: number) {
    setField("remindTime", `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`);
  }

  async function submit(enabled = remindEnabled) {
    if (!(await saveOnboarding({
      remind_time: remindTime,
      remind_enabled: enabled
    }))) return;
    router.push("/onboarding/done");
  }

  return (
    <OnboardingShell
      step={5}
      backHref="/onboarding/thought"
      skippable
      onSkip={() => void submit(false)}
      eyebrow="STEP 5 · 我来找你"
    >
      <div>
        <h1 className="font-serif text-[28px] font-medium leading-tight text-primary">
          每天什么时候<br />
          方便<span className="text-[var(--accent-coral)]">我找你</span>？
        </h1>
        <p className="mt-3 font-garamond text-[14px] italic text-secondary">
          — when may I gently knock —
        </p>
        <p className="mt-3 text-[14px] font-light leading-7 text-secondary">
          我会在这个点<span className="text-[var(--accent-deep)]">给你发一句话</span>。
        </p>
      </div>

      <div className={`mt-7 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)] backdrop-blur-xl transition-opacity ${remindEnabled ? "" : "opacity-50"}`}>
        <div className="flex gap-4">
          <WheelColumn
            label="时"
            values={hours}
            value={hour}
            disabled={!remindEnabled}
            onChange={(value) => setTime(value, minute)}
          />
          <WheelColumn
            label="分"
            values={minutes}
            value={minute}
            disabled={!remindEnabled}
            onChange={(value) => setTime(hour, value)}
          />
        </div>
      </div>

      {remindEnabled ? (
        <p className="mt-3 text-center font-garamond text-[12px] italic text-tertiary">
          — 每天 {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")} —
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setField("remindEnabled", !remindEnabled)}
        className="mt-6 flex w-full items-center justify-between rounded-[18px] border border-white/70 bg-[var(--card-bg)] px-5 py-4 text-left shadow-[var(--card-shadow)] backdrop-blur-xl"
      >
        <div>
          <div className="font-serif text-[15px] font-medium text-primary">
            {!remindEnabled ? "暂时不需要提醒" : "暂时不需要提醒"}
          </div>
          <div className="mt-0.5 font-garamond text-[12px] italic text-secondary">
            {!remindEnabled ? "okay, I will be quiet" : "I am here if you want me"}
          </div>
        </div>
        <span
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            !remindEnabled ? "bg-[var(--accent-coral)]" : "bg-[rgba(180,150,100,0.22)]"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-transform ${
              !remindEnabled ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          />
        </span>
      </button>

      <FixedFooter>
        <button type="button" onClick={() => void submit()} className="bob-button-dark w-full">
          继续
        </button>
      </FixedFooter>
    </OnboardingShell>
  );
}
