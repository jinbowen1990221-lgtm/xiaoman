"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Prediction = {
  id: string;
  content: string;
  basis: string;
  category?: "mood" | "behavior" | "sleep" | "other";
  confidence?: number;
  status: string;
  created_at: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  mood: "情绪",
  behavior: "行为",
  sleep: "睡眠",
  other: "预感"
};
type Stats = { hit: number; partial: number; total: number };
type State = { today: Prediction | null; pending: Prediction[]; stats: Stats };

const VERDICTS: { key: "hit" | "partial" | "miss"; label: string }[] = [
  { key: "hit", label: "应验了" },
  { key: "partial", label: "有点像" },
  { key: "miss", label: "没中" }
];

export function ForesightCard() {
  const [state, setState] = useState<State | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/foresight")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: State | null) => {
        if (!cancelled && d) setState(d);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function verify(id: string, result: "hit" | "partial" | "miss") {
    if (busyId) return;
    setBusyId(id);
    setVerifyError("");
    try {
      const response = await fetch("/api/foresight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, result })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "暂时没存好，请稍后再试");
      setState((prev) =>
        prev
          ? {
              ...prev,
              pending: prev.pending.filter((p) => p.id !== id),
              stats: {
                ...prev.stats,
                total: prev.stats.total + 1,
                hit: prev.stats.hit + (result === "hit" ? 1 : 0),
                partial: prev.stats.partial + (result === "partial" ? 1 : 0)
              }
            }
          : prev
      );
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "暂时没存好，请稍后再试");
      // keep it on screen so they can retry
    } finally {
      setBusyId(null);
    }
  }

  // while 小满 is composing the prediction (LLM call), show a calm placeholder
  // so the card is clearly present and not perceived as tied to anything else
  if (!loaded) {
    return (
      <section className="relative overflow-hidden rounded-[24px] border border-white/70 bg-[var(--card-bg)] px-5 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent-coral)]" strokeWidth={1.7} />
          <p className="font-garamond text-[12px] font-semibold uppercase tracking-[0.18em] text-secondary">
            小满的预感
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-serif text-[15px] text-secondary">小满在看你接下来几天</p>
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
        </div>
      </section>
    );
  }

  // loaded but nothing to show (brand-new user with no records) → hide entirely
  if (!state || (!state.today && state.pending.length === 0)) return null;

  const { today, pending, stats } = state;
  const hitRate = stats.total > 0 ? Math.round(((stats.hit + stats.partial * 0.5) / stats.total) * 100) : null;

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/70 bg-[var(--card-bg)] px-5 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent-coral)]" strokeWidth={1.7} />
          <p className="font-garamond text-[12px] font-semibold uppercase tracking-[0.18em] text-secondary">
            小满的预感
          </p>
        </div>
        {hitRate !== null ? (
          <span className="font-garamond text-[12px] italic text-[var(--accent-deep)]">
            应验 {stats.hit + stats.partial}/{stats.total}
          </span>
        ) : null}
      </div>

      {/* past predictions awaiting the user's verdict */}
      <AnimatePresence initial={false}>
        {pending.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="mb-3 overflow-hidden rounded-[18px] border border-[rgba(199,93,62,0.22)] bg-[rgba(255,247,238,0.7)] px-4 py-3.5"
          >
            <p className="font-garamond text-[11px] italic text-secondary">这是我前几天的预感 · 说中了吗？</p>
            <p className="mt-1.5 font-serif text-[15px] font-medium leading-[1.6] text-primary">{p.content}</p>
            <div className="mt-3 flex gap-2">
              {VERDICTS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => void verify(p.id, v.key)}
                  className="flex-1 rounded-full border border-white/70 bg-[rgba(255,251,243,0.8)] py-1.5 text-[12px] text-primary shadow-[var(--card-shadow)] transition-transform active:scale-[0.96] disabled:opacity-50"
                >
                  {v.label}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {verifyError ? (
        <p role="alert" className="mb-3 text-[12px] text-[var(--accent-coral)]">
          {verifyError}
        </p>
      ) : null}

      {/* today's fresh prediction */}
      {today ? (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--accent-coral)] px-2.5 py-0.5 text-[11px] font-medium text-white">
              {CATEGORY_LABEL[today.category ?? "other"]}
            </span>
            {typeof today.confidence === "number" ? (
              <span className="font-garamond text-[12px] italic text-[var(--accent-deep)]">
                把握 {today.confidence}%
              </span>
            ) : null}
          </div>
          <p className="font-serif text-[16px] font-medium leading-[1.7] text-primary">{today.content}</p>
          {today.basis ? (
            <p className="mt-1.5 font-garamond text-[12px] italic text-secondary">— {today.basis}</p>
          ) : null}
          <p className="mt-3 font-garamond text-[11px] italic text-tertiary">
            · 过两天我会回来，问你说中没有
          </p>
        </div>
      ) : null}
    </section>
  );
}
