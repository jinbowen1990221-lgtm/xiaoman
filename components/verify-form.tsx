"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { maskPhone } from "@/lib/phone";

const CODE_LENGTH = 6;

export function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";
  const controls = useAnimationControls();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const code = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    if (code.length === CODE_LENGTH && !digits.includes("") && !verifying) {
      void verify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setError("");
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  }

  async function verify(nextCode: string) {
    setVerifying(true);
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: nextCode })
    });
    const data = (await response.json().catch(() => ({}))) as {
      onboardingCompleted?: boolean;
      nextPath?: string;
      error?: string;
    };
    setVerifying(false);

    if (!response.ok) {
      setError(data.error ?? "验证码不对，再试一次");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      await controls.start({ x: [-4, 4, -4, 4, 0], transition: { duration: 0.2 } });
      return;
    }

    router.replace(data.nextPath ?? (data.onboardingCompleted ? "/" : "/onboarding/intro"));
  }

  async function resend() {
    if (seconds > 0) return;
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    setSeconds(60);
  }

  return (
    <div className="stagger-in min-h-dvh px-6 pb-8 pt-4">
      <Link
        href="/login"
        aria-label="返回"
        className="mt-2 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary shadow-[var(--card-shadow)] backdrop-blur-xl"
      >
        ←
      </Link>

      <main className="pt-8">
        <span className="postmark">
          <Heart
            className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]"
            strokeWidth={1.2}
          />
          a little code on the way
        </span>
        <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight text-primary">
          输入<span className="text-[var(--accent-coral)]">验证码</span>
        </h1>
        <p className="mt-3 text-[13px] font-light leading-7 text-secondary">
          已发送到 <span className="text-primary">+86 {maskPhone(phone)}</span>
          <br />
          约一分钟内会到，<span className="text-[var(--accent-deep)]">我等你</span>。
        </p>

        <motion.div animate={controls} className="mt-9 flex justify-between gap-2">
          {digits.map((digit, index) => {
            const filled = digit !== "";
            return (
              <input
                key={index}
                ref={(node) => {
                  inputRefs.current[index] = node;
                }}
                value={digit}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                onPaste={onPaste}
                inputMode="numeric"
                maxLength={1}
                className={`h-[54px] w-11 rounded-[14px] border bg-[var(--card-bg)] text-center font-serif text-[22px] font-medium text-primary shadow-[var(--card-shadow)] outline-none backdrop-blur-xl transition-all ${
                  filled
                    ? "border-[rgba(199,93,62,0.35)]"
                    : "border-white/70"
                } focus:border-[rgba(199,93,62,0.45)] focus:ring-1 focus:ring-[rgba(199,93,62,0.18)]`}
                aria-label={`验证码第 ${index + 1} 位`}
              />
            );
          })}
        </motion.div>

        <div className="mt-7 text-center">
          {seconds > 0 ? (
            <p className="font-garamond text-[13px] italic text-tertiary">{seconds} 秒后可重新发送</p>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="text-[13px] font-light text-[var(--accent-coral)] underline underline-offset-4"
            >
              重新发送
            </button>
          )}
          {error ? (
            <p className="mt-4 font-garamond text-[13px] italic text-[var(--accent-coral)]">{error}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
