"use client";

import { useRouter } from "next/navigation";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { saveOnboarding } from "@/lib/onboarding-client";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingNamePage() {
  const router = useRouter();
  const nickname = useOnboardingStore((state) => state.nickname);
  const setField = useOnboardingStore((state) => state.setField);
  const valid = nickname.trim().length >= 2 && nickname.trim().length <= 12;

  async function submit() {
    if (!valid) return;
    await saveOnboarding({ nickname: nickname.trim() });
    router.push("/onboarding/birthday");
  }

  return (
    <OnboardingShell step={1} backHref="/onboarding/intro" eyebrow="STEP 1 · 你的名字">
      <div>
        <h1 className="font-serif text-[28px] font-medium leading-tight text-primary">
          我该<span className="text-[var(--accent-coral)]">怎么叫</span>你？
        </h1>
        <p className="mt-3 font-garamond text-[14px] italic text-secondary">
          — what should I call you —
        </p>
        <p className="mt-3 text-[14px] font-light leading-7 text-secondary">
          一个你<span className="text-[var(--accent-deep)]">希望被叫</span>的名字。<br />
          可以不是真名，谁也不知道。
        </p>
      </div>

      <div className="mt-7 overflow-hidden rounded-[18px] border border-white/70 bg-[var(--card-bg)] px-4 py-3 shadow-[var(--card-shadow)] backdrop-blur-xl focus-within:border-[rgba(199,93,62,0.35)] focus-within:ring-1 focus-within:ring-[rgba(199,93,62,0.18)]">
        <p className="font-garamond text-[11px] uppercase tracking-[0.18em] text-tertiary">name</p>
        <input
          value={nickname}
          onChange={(event) => setField("nickname", event.target.value.slice(0, 12))}
          inputMode="text"
          placeholder="五花、阿和、或者别的什么"
          className="mt-1 h-[36px] w-full border-0 bg-transparent font-serif text-[18px] text-primary outline-none placeholder:font-sans placeholder:text-tertiary"
        />
      </div>

      <p className="mt-3 font-garamond text-[12px] italic text-tertiary">
        {nickname.trim().length === 0
          ? "我会一直这么叫你 ·"
          : valid
            ? `好，"${nickname.trim()}" ·`
            : "再短一点点 ·"}
        <span className="ml-1">{nickname.trim().length}/12</span>
      </p>

      <FixedFooter>
        <button
          type="button"
          disabled={!valid}
          onClick={submit}
          className="bob-button-dark w-full disabled:opacity-30"
        >
          继续
        </button>
      </FixedFooter>
    </OnboardingShell>
  );
}
