"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { saveOnboarding } from "@/lib/onboarding-client";
import type { Lifestyle } from "@/lib/user-types";
import { useOnboardingStore } from "@/store/onboarding-store";

const options: Array<{ label: string; en: string; value: Lifestyle }> = [
  { label: "在上班", en: "working", value: "working" },
  { label: "自由职业 / 做自己的事", en: "doing my own thing", value: "freelance" },
  { label: "在读书", en: "studying", value: "studying" },
  { label: "暂时不确定", en: "in between", value: "uncertain" }
];

export default function OnboardingLifestylePage() {
  const router = useRouter();
  const lifestyle = useOnboardingStore((state) => state.lifestyle);
  const setField = useOnboardingStore((state) => state.setField);

  async function submit() {
    if (!lifestyle) return;
    if (!(await saveOnboarding({ lifestyle }))) return;
    router.push("/onboarding/thought");
  }

  async function skip() {
    if (!(await saveOnboarding({ lifestyle: null }))) return;
    router.push("/onboarding/thought");
  }

  return (
    <OnboardingShell
      step={3}
      backHref="/onboarding/birthday"
      skippable
      onSkip={() => void skip()}
      eyebrow="STEP 3 · 你的节奏"
    >
      <div>
        <h1 className="font-serif text-[28px] font-medium leading-tight text-primary">
          你现在<span className="text-[var(--accent-coral)]">是什么</span>状态？
        </h1>
        <p className="mt-3 font-garamond text-[14px] italic text-secondary">— where are you in life —</p>
        <p className="mt-3 text-[14px] font-light leading-7 text-secondary">
          选一个<span className="text-[var(--accent-deep)]">最近</span>的。<br />
          以后会变，我知道。
        </p>
      </div>

      <div className="mt-7 space-y-3">
        {options.map((option, idx) => {
          const active = lifestyle === option.value;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => setField("lifestyle", option.value)}
              aria-pressed={active}
              className={`group relative w-full overflow-hidden rounded-[18px] border bg-[var(--card-bg)] px-5 py-4 text-left shadow-[var(--card-shadow)] backdrop-blur-xl transition-all duration-200 active:scale-[0.99] ${
                active
                  ? "border-[rgba(199,93,62,0.40)] ring-1 ring-[rgba(199,93,62,0.18)] shadow-[0_8px_24px_rgba(199,93,62,0.14)]"
                  : "border-white/70 hover:scale-[1.01]"
              }`}
            >
              <span className="font-garamond text-[11px] italic text-tertiary">no. 0{idx + 1}</span>
              <div className="mt-0.5 flex items-center justify-between gap-3">
                <div>
                  <div className="font-serif text-[17px] font-medium text-primary">{option.label}</div>
                  <div className="mt-0.5 font-garamond text-[12px] italic text-secondary">{option.en}</div>
                </div>
                {active ? (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-coral)] text-white shadow-[0_4px_10px_rgba(199,93,62,0.32)]">
                    <Check size={14} strokeWidth={2.2} />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <FixedFooter>
        <button
          type="button"
          disabled={!lifestyle}
          onClick={submit}
          className="bob-button-dark w-full disabled:opacity-30"
        >
          继续
        </button>
      </FixedFooter>
    </OnboardingShell>
  );
}
