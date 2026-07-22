"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";

type OnboardingShellProps = {
  step: number;
  backHref?: string;
  skippable?: boolean;
  onSkip?: () => void;
  hideBack?: boolean;
  eyebrow?: string;
  children: ReactNode;
};

const TOTAL_STEPS = 6;

export function OnboardingShell({
  step,
  backHref,
  skippable = false,
  onSkip,
  hideBack = false,
  eyebrow,
  children
}: OnboardingShellProps) {
  const router = useRouter();
  const hydrateFromUser = useOnboardingStore((state) => state.hydrateFromUser);
  const saveError = useOnboardingStore((state) => state.saveError);
  const setSaveError = useOnboardingStore((state) => state.setSaveError);

  useEffect(() => {
    setSaveError("");
    void fetch("/api/user/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user?: Parameters<typeof hydrateFromUser>[0] } | null) => {
        if (data?.user) hydrateFromUser(data.user);
      })
      .catch(() => undefined);
  }, [hydrateFromUser, setSaveError]);

  return (
    <div className="relative min-h-dvh pb-32 pt-3">
      <header className="px-6">
        <div className="mb-4 flex items-center justify-between">
          {hideBack ? (
            <span className="h-9 w-9" />
          ) : (
            <button
              type="button"
              onClick={() => router.push(backHref ?? "/onboarding/intro")}
              aria-label="返回"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary shadow-[var(--card-shadow)] backdrop-blur-xl"
            >
              ←
            </button>
          )}
          {skippable ? (
            <button
              type="button"
              onClick={onSkip}
              className="font-garamond text-[13px] italic text-secondary"
            >
              先跳过
            </button>
          ) : (
            <span className="h-9 w-12" />
          )}
        </div>

        {/* Step dots — six small markers, current one is a heart, past ones filled, future ones hollow */}
        <div className="flex items-center justify-center gap-2.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const idx = i + 1;
            if (idx < step) {
              return (
                <span
                  key={i}
                  className="h-1.5 w-6 rounded-full"
                  style={{ background: "var(--accent-coral)", opacity: 0.55 }}
                />
              );
            }
            if (idx === step) {
              return (
                <span
                  key={i}
                  className="inline-flex h-3 items-center gap-1"
                  aria-current="step"
                >
                  <Heart
                    className="heart-pulse h-3 w-3 fill-[var(--accent-coral)] text-[var(--accent-coral)]"
                    strokeWidth={1.2}
                  />
                </span>
              );
            }
            return (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "rgba(180,150,100,0.30)" }}
              />
            );
          })}
        </div>

        {eyebrow ? (
          <p className="eyebrow mt-6 block text-center">{eyebrow}</p>
        ) : null}
        {saveError ? (
          <p role="alert" className="mt-3 text-center text-[13px] text-[var(--accent-coral)]">
            {saveError}
          </p>
        ) : null}
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`stagger-in mt-${eyebrow ? "4" : "10"} px-6`}
      >
        {children}
      </motion.main>
    </div>
  );
}
