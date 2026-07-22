"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { WheelColumn } from "@/components/onboarding/wheel-column";
import { saveOnboarding } from "@/lib/onboarding-client";
import type { BirthdayType } from "@/lib/user-types";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingBirthdayPage() {
  const router = useRouter();
  const birthdayType = useOnboardingStore((state) => state.birthdayType);
  const setField = useOnboardingStore((state) => state.setField);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear() - 25);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const years = useMemo(
    () => Array.from({ length: 81 }, (_, index) => now.getFullYear() - 80 + index),
    [now]
  );
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  async function submit() {
    const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setField("birthday", value);
    if (!(await saveOnboarding({ birthday: value, birthday_type: birthdayType }))) return;
    router.push("/onboarding/lifestyle");
  }

  async function skip() {
    if (!(await saveOnboarding({ birthday: null }))) return;
    router.push("/onboarding/lifestyle");
  }

  return (
    <OnboardingShell
      step={2}
      backHref="/onboarding/name"
      skippable
      onSkip={() => void skip()}
      eyebrow="STEP 2 · 你的生日"
    >
      <div>
        <h1 className="font-serif text-[28px] font-medium leading-tight text-primary">
          你的<span className="text-[var(--accent-coral)]">生日</span>是？
        </h1>
        <p className="mt-3 font-garamond text-[14px] italic text-secondary">— a day to remember —</p>
        <p className="mt-3 text-[14px] font-light leading-7 text-secondary">
          只是想在你生日那天，<span className="text-[var(--accent-deep)]">第一个跟你说</span>。<br />
          不想说也没关系，右上角可以跳过。
        </p>
      </div>

      <div className="mt-6 inline-flex gap-2 rounded-full bg-[rgba(255,251,243,0.66)] p-1 backdrop-blur-xl">
        {(["solar", "lunar"] as BirthdayType[]).map((type) => {
          const active = birthdayType === type;
          return (
            <button
              type="button"
              key={type}
              onClick={() => setField("birthdayType", type)}
              className={`rounded-full px-5 py-1.5 text-[13px] transition-colors ${
                active
                  ? "bg-[var(--btn-dark)] text-white shadow-[0_4px_10px_rgba(42,37,32,0.16)]"
                  : "text-secondary"
              }`}
            >
              {type === "solar" ? "阳历" : "农历"}
            </button>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
        <div className="flex gap-4">
          <WheelColumn label="年" values={years} value={year} onChange={setYear} />
          <WheelColumn label="月" values={months} value={month} onChange={setMonth} />
          <WheelColumn label="日" values={days} value={day} onChange={setDay} />
        </div>
      </div>

      <p className="mt-3 text-center font-garamond text-[12px] italic text-tertiary">
        — {birthdayType === "solar" ? "阳历" : "农历"}　{year} · {month} · {day} —
      </p>

      <FixedFooter>
        <button type="button" onClick={submit} className="bob-button-dark w-full">
          继续
        </button>
      </FixedFooter>
    </OnboardingShell>
  );
}
