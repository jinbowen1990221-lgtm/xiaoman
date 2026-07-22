"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StarMascot } from "@/components/decorative/StarMascot";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { saveOnboarding } from "@/lib/onboarding-client";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function OnboardingDonePage() {
  const router = useRouter();
  const nickname = useOnboardingStore((state) => state.nickname);
  const savePromise = useRef<Promise<boolean> | null>(null);
  const [going, setGoing] = useState<null | "record" | "home">(null);

  useEffect(() => {
    // mark onboarding complete (also refreshes the session cookie)
    savePromise.current = saveOnboarding({ onboarding_completed: true });
    void savePromise.current;
  }, []);

  async function go(target: "record" | "home") {
    if (going) return;
    setGoing(target);
    // ensure the cookie is updated before navigating, else middleware bounces back
    const saved = await savePromise.current;
    if (!saved) {
      setGoing(null);
      return;
    }
    router.replace(target === "record" ? "/record" : "/");
  }

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
        <button
          type="button"
          onClick={() => void go("record")}
          disabled={going !== null}
          className="bob-button-dark w-full disabled:opacity-70"
        >
          {going === "record" ? "正在为你准备…" : "去记录今天的一件事"}
        </button>
        <button
          type="button"
          onClick={() => void go("home")}
          disabled={going !== null}
          className="mt-3 flex h-10 w-full items-center justify-center font-garamond text-[13px] italic text-secondary disabled:opacity-50"
        >
          {going === "home" ? "正在进入…" : "先看看首页 →"}
        </button>
      </FixedFooter>
    </OnboardingShell>
  );
}
