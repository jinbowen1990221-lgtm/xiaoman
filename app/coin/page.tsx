"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CoinMascot } from "@/components/decorative/CoinMascot";
import { TopNav } from "@/components/top-nav";
import { useBobStore } from "@/store/bob-store";

export default function CoinPage() {
  const router = useRouter();
  const setLastCoinResult = useBobStore((state) => state.setLastCoinResult);
  const [optionA, setOptionA] = useState("去");
  const [optionB, setOptionB] = useState("不去");
  const [flips, setFlips] = useState(0);
  const [resultKey, setResultKey] = useState<"a" | "b" | null>(null);
  const [coinFlipId, setCoinFlipId] = useState<string | null>(null);
  const result = resultKey === "a" ? optionA || "A" : resultKey === "b" ? optionB || "B" : null;

  const bobLine = useMemo(() => {
    if (!result) return "先把两个答案写出来。你会更快听见自己。";
    return `选 ${result} 吧。别想太多。`;
  }, [result]);

  function flipCoin() {
    const nextKey = Math.random() > 0.5 ? "a" : "b";
    const nextResult = nextKey === "a" ? optionA || "A" : optionB || "B";
    const nextComment = `选 ${nextResult} 吧。别想太多。`;
    setFlips((current) => current + 1);
    setResultKey(nextKey);
    setCoinFlipId(null);
    setLastCoinResult(nextResult);
    window.setTimeout(() => {
      void persistCoinFlip(nextKey, nextComment);
    }, 1000);
  }

  async function persistCoinFlip(resultValue: "a" | "b", bobComment: string) {
    try {
      const response = await fetch("/api/coin-flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option_a: optionA || "A",
          option_b: optionB || "B",
          result: resultValue,
          bob_comment: bobComment
        })
      });
      const data = (await response.json().catch(() => null)) as { id?: string } | null;
      if (data?.id) setCoinFlipId(data.id);
    } catch {
      // Bob remembers quietly. If this fails, the coin should still feel instant.
    }
  }

  function resetCoin() {
    setResultKey(null);
    setCoinFlipId(null);
  }

  async function acceptResult() {
    if (coinFlipId) {
      try {
        await fetch("/api/coin-flip", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: coinFlipId, followed: true })
        });
      } catch {
        // Silent by design.
      }
    }
    router.push("/");
  }

  return (
    <div className="secondary-page-pad relative z-10 min-h-dvh pb-10">
      <TopNav title="抛硬币" />

      <section className="stagger-in flex min-h-[calc(100dvh-128px)] flex-col">
        <div>
          <p className="eyebrow">YES OR NO · 让硬币替你说</p>
          <h1 className="mt-3 font-serif text-[30px] font-medium leading-tight text-primary">
            <span className="ink-underline">抛一下</span>，再决定。
          </h1>
          <p className="mt-3 text-[14px] font-light leading-6 text-secondary">
            写下两个答案，听听落地的声音。
          </p>
        </div>

        {/* Option pair */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="group relative overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)] backdrop-blur-xl transition-all hover:scale-[1.01] hover:shadow-[0_8px_28px_rgba(180,150,100,0.14)]">
            <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 font-garamond text-[12px] italic text-secondary">opt.A</span>
            <span className="font-garamond text-[12px] uppercase tracking-[0.16em] text-secondary">A</span>
            <textarea
              value={optionA}
              onChange={(event) => setOptionA(event.target.value)}
              className="mt-2 h-16 w-full border-0 bg-transparent text-[16px] font-medium leading-[1.4] text-primary outline-none placeholder:text-tertiary"
              placeholder="去"
            />
          </label>
          <label className="group relative overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)] backdrop-blur-xl transition-all hover:scale-[1.01] hover:shadow-[0_8px_28px_rgba(180,150,100,0.14)]">
            <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 font-garamond text-[12px] italic text-secondary">opt.B</span>
            <span className="font-garamond text-[12px] uppercase tracking-[0.16em] text-secondary">B</span>
            <textarea
              value={optionB}
              onChange={(event) => setOptionB(event.target.value)}
              className="mt-2 h-16 w-full border-0 bg-transparent text-[16px] font-medium leading-[1.4] text-primary outline-none placeholder:text-tertiary"
              placeholder="不去"
            />
          </label>
        </div>

        {/* Coin stage */}
        <div className="relative flex flex-1 flex-col items-center justify-center py-10 text-center">
          {/* ambient ring */}
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(212,165,116,0.18), transparent 65%)", filter: "blur(20px)" }} />

          <motion.div
            key={flips}
            animate={{ rotateY: flips ? 720 : 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="coin-aura relative grid h-[200px] w-[200px] place-items-center [transform-style:preserve-3d]"
          >
            <CoinMascot
              size={132}
              result={result}
              face="blank"
              options={[optionA || "A", optionB || "B"]}
            />
          </motion.div>

          <p className="mt-7 font-serif text-[22px] font-medium text-[var(--accent-coral)]">
            {result ?? "还没落下"}
          </p>
          <p className="mt-2 text-[13px] font-light leading-relaxed text-secondary">{bobLine}</p>

          {result ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetCoin}
                className="rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] px-5 py-2 text-[13px] font-light text-primary shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform hover:scale-[1.02]"
              >
                再抛一次
              </button>
              <button
                type="button"
                onClick={acceptResult}
                className="rounded-full bg-[var(--btn-dark)] px-5 py-2 text-[13px] font-medium text-white shadow-[0_8px_18px_rgba(42,37,32,0.18)] transition-transform hover:scale-[1.02]"
              >
                好，就这样
              </button>
            </div>
          ) : null}
        </div>

        {!result ? (
          <button
            type="button"
            onClick={flipCoin}
            className="mt-4 h-[56px] w-full rounded-[18px] bg-[var(--btn-dark)] text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(42,37,32,0.18)] transition-transform duration-300 ease-out active:scale-[0.965] active:duration-100"
          >
            抛！
          </button>
        ) : null}
      </section>
    </div>
  );
}
