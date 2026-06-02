"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarMascot } from "@/components/decorative/StarMascot";
import { FixedFooter } from "@/components/onboarding/fixed-footer";

export default function OnboardingIntroPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"a" | "b">("a");

  async function leave() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="relative min-h-dvh px-6 pb-32 pt-4">
      <button
        type="button"
        onClick={leave}
        aria-label="返回"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary shadow-[var(--card-shadow)] backdrop-blur-xl"
      >
        ←
      </button>

      <main className="stagger-in flex min-h-[calc(100dvh-220px)] flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {screen === "a" ? (
            <motion.section
              key="a"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <StarMascot size={120} />
              <span className="postmark mt-7">
                <Heart
                  className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]"
                  strokeWidth={1.2}
                />
                hello, friend
              </span>
              <h1 className="mt-5 font-serif text-[34px] font-medium leading-tight text-primary">
                我是<span className="text-[var(--accent-coral)]">小满</span>。
              </h1>
              <p className="mt-4 font-garamond text-[15px] italic text-secondary">
                I am here to know you, not to help you.
              </p>
              <p className="mt-3 max-w-[280px] text-[14px] font-light leading-7 text-secondary">
                我不是助手。<br />
                我是来<span className="text-[var(--accent-deep)]">了解你</span>的。
              </p>
            </motion.section>
          ) : (
            <motion.section
              key="b"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <StarMascot size={120} />
              <span className="postmark mt-7">
                <Heart
                  className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]"
                  strokeWidth={1.2}
                />
                a quiet promise
              </span>
              <h1 className="mt-5 font-serif text-[34px] font-medium leading-tight text-primary">
                你说，<span className="text-[var(--accent-coral)]">我听</span>。
              </h1>
              <h2 className="mt-1 font-serif text-[34px] font-medium leading-tight text-primary">
                我会<span className="text-[var(--accent-coral)]">记住</span>。
              </h2>
              <p className="mt-4 font-garamond text-[15px] italic text-secondary">
                you talk · I listen · I remember
              </p>
              <p className="mt-3 max-w-[300px] text-[14px] font-light leading-7 text-secondary">
                第二天，<br />
                我会告诉你<span className="text-[var(--accent-deep)]">我注意到了什么</span>。
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <FixedFooter>
        <button
          type="button"
          onClick={() => (screen === "a" ? setScreen("b") : router.push("/onboarding/name"))}
          className="bob-button-dark w-full"
        >
          {screen === "a" ? "嗯" : "开始吧"}
        </button>
        {screen === "a" ? (
          <p className="mt-3 text-center font-garamond text-[12px] italic text-tertiary">
            — 慢慢来，不急 —
          </p>
        ) : null}
      </FixedFooter>
    </div>
  );
}
