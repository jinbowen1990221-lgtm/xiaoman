"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StarMascot } from "@/components/decorative/StarMascot";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { saveOnboarding } from "@/lib/onboarding-client";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingDonePage() {
  const nickname = useOnboardingStore((state) => state.nickname);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void saveOnboarding({ onboarding_completed: true }).finally(() => setSaved(true));
  }, []);

  return (
    <OnboardingShell step={6} hideBack eyebrow="DONE · 都告诉我了">
      <div className="flex min-h-[48dvh] flex-col items-center justify-center text-center">
        <StarMascot size={110} />

        <span className="postmark mt-6">
          <Heart
            className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]"
            strokeWidth={1.2}
          />
          nice to meet you
        </span>

        <h1 className="mt-4 font-serif text-[30px] font-medium leading-tight text-primary">
          好了，<span className="text-[var(--accent-coral)]">{nickname || "你"}</span>。
        </h1>
        <p className="mt-3 font-garamond text-[15px] italic text-secondary">
          — now, tell me about today —
        </p>
        <p className="mt-3 max-w-[280px] text-[14px] font-light leading-7 text-secondary">
          现在，<br />
          和我说说<span className="text-[var(--accent-deep)]">今天</span>？
        </p>
      </div>

      <FixedFooter>
        <Link
          href="/record"
          className={`bob-button-dark w-full ${saved ? "" : "opacity-60"}`}
        >
          去记录今天的一件事
        </Link>
        <Link
          href="/"
          className="mt-3 flex h-10 items-center justify-center font-garamond text-[13px] italic text-secondary"
        >
          先看看首页 →
        </Link>
      </FixedFooter>
    </OnboardingShell>
  );
}
