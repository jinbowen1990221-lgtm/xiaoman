"use client";

import { useRouter } from "next/navigation";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { saveOnboarding } from "@/lib/onboarding-client";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingThoughtPage() {
  const router = useRouter();
  const initialThought = useOnboardingStore((state) => state.initialThought);
  const setField = useOnboardingStore((state) => state.setField);
  const text = initialThought.slice(0, 200);

  async function submit(skip = false) {
    if (skip) {
      if (!(await saveOnboarding({ initial_thought: "" }))) return;
    } else if (text.trim()) {
      if (!(await saveOnboarding({ initial_thought: text.trim() }))) return;
    }
    router.push("/onboarding/remind");
  }

  return (
    <OnboardingShell
      step={4}
      backHref="/onboarding/lifestyle"
      skippable
      onSkip={() => void submit(true)}
      eyebrow="STEP 4 · 一件小事"
    >
      <div>
        <h1 className="font-serif text-[28px] font-medium leading-tight text-primary">
          最近<span className="text-[var(--accent-coral)]">反复出现</span>的<br />
          一件事？
        </h1>
        <p className="mt-3 font-garamond text-[14px] italic text-secondary">
          — one thing that keeps coming back —
        </p>
        <p className="mt-3 text-[14px] font-light leading-7 text-secondary">
          一句话就行。<br />
          我会<span className="text-[var(--accent-deep)]">放在心上</span>。
        </p>
      </div>

      <section className="paper-card mt-7 px-5 py-5">
        <textarea
          value={text}
          onChange={(event) => setField("initialThought", event.target.value.slice(0, 200))}
          inputMode="text"
          placeholder="想到什么写什么。不完整也没事。"
          className="min-h-[140px] max-h-60 w-full border-0 bg-transparent font-serif text-[16px] leading-[1.8] text-primary outline-none placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-tertiary"
        />
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-[rgba(180,150,100,0.20)] pt-3">
          <span className="font-garamond text-[12px] italic text-secondary">
            {text.length === 0 ? "一句话就行" : "小满听着"}
          </span>
          <span className="font-garamond text-[11px] italic text-tertiary">{text.length} / 200</span>
        </div>
      </section>

      <FixedFooter>
        <button
          type="button"
          onClick={() => void submit(!text.trim())}
          className="bob-button-dark w-full"
        >
          {text.trim() ? "继续" : "先跳过"}
        </button>
      </FixedFooter>
    </OnboardingShell>
  );
}
