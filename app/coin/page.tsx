"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoinMascot } from "@/components/decorative/CoinMascot";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { TopNav } from "@/components/top-nav";
import { StarMascot } from "@/components/decorative/StarMascot";
import { useBobStore } from "@/store/bob-store";

type Decision = { analysis: string; lean: "a" | "b" | "none"; basis: string };

export default function CoinPage() {
  const router = useRouter();
  const setLastCoinResult = useBobStore((state) => state.setLastCoinResult);
  const [optionA, setOptionA] = useState("去");
  const [optionB, setOptionB] = useState("不去");

  // decision reasoning (the hero)
  const [decision, setDecision] = useState<Decision | null>(null);
  const [deciding, setDeciding] = useState(false);

  // coin flip (playful fallback)
  const [showCoin, setShowCoin] = useState(false);
  const [flips, setFlips] = useState(0);
  const [resultKey, setResultKey] = useState<"a" | "b" | null>(null);
  const [coinFlipId, setCoinFlipId] = useState<string | null>(null);
  const [savingFlip, setSavingFlip] = useState(false);
  const [saveError, setSaveError] = useState("");
  const coinResult = resultKey === "a" ? optionA || "A" : resultKey === "b" ? optionB || "B" : null;

  async function decide() {
    if (deciding) return;
    setDeciding(true);
    setDecision(null);
    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionA: optionA || "A", optionB: optionB || "B" })
      });
      const data = (res.ok ? await res.json() : null) as Decision | null;
      setDecision(
        data?.analysis
          ? data
          : { analysis: "我先没想清楚，等一下再陪你想一次？", lean: "none", basis: "" }
      );
    } catch {
      setDecision({ analysis: "刚刚没接上，等一下再试一次。", lean: "none", basis: "" });
    } finally {
      setDeciding(false);
    }
  }

  function flipCoin() {
    if (savingFlip) return;
    setShowCoin(true);
    const nextKey = Math.random() > 0.5 ? "a" : "b";
    const nextResult = nextKey === "a" ? optionA || "A" : optionB || "B";
    setFlips((c) => c + 1);
    setResultKey(nextKey);
    setCoinFlipId(null);
    setSaveError("");
    setSavingFlip(true);
    setLastCoinResult(nextResult);
    window.setTimeout(() => void persistCoinFlip(nextKey), 1000);
  }

  async function persistCoinFlip(resultValue: "a" | "b") {
    try {
      const response = await fetch("/api/coin-flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option_a: optionA || "A",
          option_b: optionB || "B",
          result: resultValue,
          bob_comment: `硬币替你选了 ${resultValue === "a" ? optionA : optionB}`
        })
      });
      const data = (await response.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!response.ok || !data?.id) {
        throw new Error(data?.error ?? "暂时没记住这次结果，请稍后再试");
      }
      setCoinFlipId(data.id);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "暂时没记住这次结果，请稍后再试");
    } finally {
      setSavingFlip(false);
    }
  }

  async function done() {
    if (savingFlip) return;
    if (!coinFlipId) {
      setSaveError("这次结果还没有保存，请重新抛一次");
      return;
    }
    setSaveError("");
    try {
      const response = await fetch("/api/coin-flip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coinFlipId, followed: true })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "暂时没记住这次结果，请稍后再试");
      router.push("/");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "暂时没记住这次结果，请稍后再试");
    }
  }

  const leanA = decision?.lean === "a";
  const leanB = decision?.lean === "b";

  return (
    <div className="secondary-page-pad relative z-10 min-h-dvh pb-32">
      <TopNav title="帮你想想" />

      <section className="stagger-in flex flex-col">
        <div>
          <p className="eyebrow">DECISION · 让小满陪你想</p>
          <h1 className="mt-3 font-serif text-[30px] font-medium leading-tight text-primary">
            <span className="ink-underline">拿不定</span>主意？
          </h1>
          <p className="mt-2 text-[14px] font-light leading-6 text-secondary">
            写下两个选择，小满结合你这阵子的记录，陪你推演一下。
          </p>
        </div>

        {/* options */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {([["A", optionA, setOptionA, "去", leanA], ["B", optionB, setOptionB, "不去", leanB]] as const).map(
            ([tag, val, setter, ph, lean]) => (
              <label
                key={tag}
                className={`relative overflow-hidden rounded-[16px] border px-4 py-3 shadow-[var(--card-shadow)] backdrop-blur-xl transition-colors ${
                  lean
                    ? "border-[var(--accent-coral)] bg-[rgba(255,247,238,0.85)]"
                    : "border-white/70 bg-[var(--card-bg)]"
                }`}
              >
                <span className="font-garamond text-[11px] uppercase tracking-[0.16em] text-secondary">
                  {tag}
                </span>
                {lean ? (
                  <span className="absolute right-2.5 top-2.5 font-garamond text-[10px] italic text-[var(--accent-coral)]">
                    小满偏这个
                  </span>
                ) : null}
                <textarea
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  className="mt-1 h-10 w-full resize-none border-0 bg-transparent text-[16px] font-medium leading-[1.35] text-primary outline-none placeholder:text-tertiary"
                  placeholder={ph}
                />
              </label>
            )
          )}
        </div>

        {/* decision reasoning */}
        <AnimatePresence mode="wait">
          {deciding ? (
            <motion.div
              key="deciding"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-center gap-3 rounded-[18px] border border-white/70 bg-[rgba(255,247,238,0.7)] px-4 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl"
            >
              <StarMascot size={32} />
              <span className="flex items-center gap-2 font-serif text-[14px] text-secondary">
                小满在翻你的记录
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--accent-coral)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </span>
              </span>
            </motion.div>
          ) : decision ? (
            <motion.div
              key="decision"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-[18px] border border-[rgba(199,93,62,0.22)] bg-[rgba(255,247,238,0.7)] px-5 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl"
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent-coral)]" strokeWidth={1.7} />
                <span className="font-garamond text-[12px] uppercase tracking-[0.16em] text-secondary">
                  小满的推演
                </span>
              </div>
              <p className="font-serif text-[15px] font-medium leading-[1.75] text-primary">
                {decision.analysis}
              </p>
              <p className="mt-3 font-garamond text-[11px] italic text-tertiary">
                · 这只是把你说过的话连起来，最终由你来选
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* playful coin fallback */}
        <AnimatePresence>
          {showCoin ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 flex flex-col items-center overflow-hidden text-center"
            >
              <motion.div
                key={flips}
                animate={{ rotateY: flips ? 720 : 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="grid h-[120px] w-[120px] place-items-center [transform-style:preserve-3d]"
              >
                <CoinMascot size={104} result={coinResult} face="blank" options={[optionA || "A", optionB || "B"]} />
              </motion.div>
              <p className="mt-3 font-serif text-[18px] font-medium text-[var(--accent-coral)]">
                硬币说：{coinResult}
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={flipCoin}
                  disabled={savingFlip}
                  className="rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] px-5 py-2 text-[13px] font-light text-primary shadow-[var(--card-shadow)] active:scale-[0.97] disabled:opacity-50"
                >
                  再抛一次
                </button>
                <button
                  type="button"
                  onClick={() => void done()}
                  disabled={savingFlip || !coinFlipId}
                  className="rounded-full bg-[var(--btn-dark)] px-5 py-2 text-[13px] font-medium text-white shadow-[0_8px_18px_rgba(42,37,32,0.18)] active:scale-[0.97] disabled:opacity-50"
                >
                  {savingFlip ? "保存中…" : "好，就这样"}
                </button>
              </div>
              {saveError ? (
                <p className="mt-3 text-[13px] text-[var(--accent-coral)]" role="alert">
                  {saveError}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <FixedFooter>
        <button
          type="button"
          onClick={() => void decide()}
          disabled={deciding}
          className="bob-button-dark h-[56px] w-full text-[15px] active:scale-[0.965] disabled:opacity-50"
        >
          {decision ? "再想一次" : "让小满帮我想想"}
        </button>
        {!showCoin ? (
          <button
            type="button"
            onClick={flipCoin}
            className="mt-2 w-full text-center font-garamond text-[13px] italic text-secondary"
          >
            实在选不出？让硬币替你定 →
          </button>
        ) : null}
      </FixedFooter>
    </div>
  );
}
