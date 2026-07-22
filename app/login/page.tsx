"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StarMascot } from "@/components/decorative/StarMascot";
import { normalizePhone } from "@/lib/phone";

export default function LoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = phone.length === 11 && !loading;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "没发出去，再试一次。");
        return;
      }

      router.push(`/login/verify?phone=${phone}`);
    } catch {
      setError("网络有点慢，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stagger-in flex min-h-dvh flex-col items-center px-6 pb-10 pt-[4vh]">
      <main className="flex w-full flex-col items-center">
        <StarMascot size={120} />

        <span className="postmark mt-7">
          <Heart
            className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]"
            strokeWidth={1.2}
          />
          hello, stranger
        </span>

        <h1 className="mt-5 text-center font-serif text-[34px] font-medium leading-tight text-primary">
          你<span className="text-[var(--accent-coral)]">好</span>呀
        </h1>
        <p className="mt-3 text-center font-garamond text-[15px] italic text-secondary">
          — before we meet —
        </p>
        <p className="mt-3 text-center text-[14px] font-light leading-7 text-secondary">
          在见面之前，<br />
          先让我<span className="text-[var(--accent-deep)]">认得你</span>。
        </p>

        <div className="mt-10 w-full overflow-hidden rounded-[18px] border border-white/70 bg-[var(--card-bg)] px-4 py-3 shadow-[var(--card-shadow)] backdrop-blur-xl focus-within:border-[rgba(199,93,62,0.35)] focus-within:ring-1 focus-within:ring-[rgba(199,93,62,0.18)]">
          <p className="font-garamond text-[11px] uppercase tracking-[0.18em] text-tertiary">phone</p>
          <div className="mt-1 flex items-center">
            <span className="font-serif text-[18px] text-primary">+86</span>
            <span className="mx-3 h-5 w-px bg-[rgba(199,93,62,0.22)]" />
            <input
              ref={inputRef}
              value={phone}
              onChange={(event) => setPhone(normalizePhone(event.target.value))}
              inputMode="tel"
              autoComplete="tel"
              maxLength={11}
              placeholder="请输入手机号"
              className="min-w-0 flex-1 border-0 bg-transparent font-serif text-[18px] tracking-[0.04em] text-primary outline-none placeholder:font-sans placeholder:text-[15px] placeholder:tracking-normal placeholder:text-tertiary"
            />
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-center font-garamond text-[13px] italic text-[var(--accent-coral)]">
            {error}
          </p>
        ) : null}
      </main>

      <footer className="mt-12 w-full">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="bob-button-dark w-full disabled:opacity-30"
        >
          {loading ? "稍等" : "继续"}
        </button>
        <p className="mt-5 text-center text-[11px] leading-relaxed text-tertiary">
          点击“继续”即表示同意
          <button type="button" className="underline underline-offset-2">
            《用户协议》
          </button>
          和
          <button type="button" className="underline underline-offset-2">
            《隐私政策》
          </button>
        </p>
      </footer>
    </div>
  );
}
