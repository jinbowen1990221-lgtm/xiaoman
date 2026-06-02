"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { noteResult } from "@/lib/mock-data";
import { useBobStore } from "@/store/bob-store";

type FeedbackType = "accepted" | null;

export function NoteResult() {
  const router = useRouter();
  const params = useSearchParams();
  const storedWord = useBobStore((state) => state.selectedWord);
  const selectedWord = params.get("choice") ?? storedWord ?? "转机";
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [busy, setBusy] = useState(false);
  // null while 小满 is composing the omen from the user's real records
  const [omen, setOmen] = useState<{ text: string; possibility: number } | null>(null);

  const now = new Date();
  const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  const todayStamp = `${now.getMonth() + 1} · ${now.getDate()} · ${weekdayEn}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/today-omen?choice=${encodeURIComponent(selectedWord)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { text?: string; possibility?: number } | null) => {
        if (cancelled) return;
        setOmen(
          d?.text
            ? { text: d.text, possibility: d.possibility ?? noteResult.possibility }
            : { text: noteResult.text, possibility: noteResult.possibility }
        );
      })
      .catch(() => {
        if (!cancelled) setOmen({ text: noteResult.text, possibility: noteResult.possibility });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedWord]);

  function accept() {
    if (busy || !omen) return;
    setBusy(true);
    setFeedback("accepted");
    void fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        choice: selectedWord,
        text: omen.text,
        possibility: omen.possibility
      })
    }).catch(() => undefined);
    window.setTimeout(() => {
      router.push("/");
    }, 1800);
  }

  function leave() {
    router.push("/");
  }

  return (
    <section className="relative">
      <span className="inline-flex rounded-[20px] bg-[#F5E8E0] px-3 py-1.5 text-xs text-accent">
        你选了 · {selectedWord}
      </span>
      <h1 className="serif-title mt-5 text-[22px]">今日预感</h1>
      <p className="garamond-note mt-1 text-sm">— a note for today —</p>

      <article className="bob-card mt-6 p-6">
        <p className="text-right text-[11px] text-secondary">{todayStamp}</p>
        {omen ? (
          <p className="mt-5 font-serif text-base font-medium leading-[1.8] text-primary">
            {omen.text}
          </p>
        ) : (
          <p className="mt-5 flex items-center gap-2 font-serif text-base font-medium leading-[1.8] text-secondary">
            小满在为你翻今天
            <span className="inline-flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent-coral)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </span>
          </p>
        )}
        <div className="my-5 border-t border-dashed border-tertiary" />
        <div className="flex items-baseline justify-between">
          <span className="meta-label">POSSIBILITY</span>
          <span className="font-serif text-[32px] font-bold leading-none text-accent">
            {omen ? `${omen.possibility}%` : "··%"}
          </span>
        </div>
      </article>

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={leave}
          disabled={busy}
          className="bob-button-light disabled:opacity-50"
        >
          先放一放
        </button>
        <button
          type="button"
          onClick={accept}
          disabled={busy || !omen}
          className="bob-button-dark disabled:opacity-50"
        >
          收下
        </button>
      </div>

      <p className="mt-3 text-center font-garamond text-[12px] italic text-tertiary">
        收下后小满会替你记着 · 在「回看 · 收下的预感」里能再翻到
      </p>

      {/* Accept feedback overlay */}
      <AnimatePresence>
        {feedback === "accepted" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-8"
            style={{ background: "rgba(247, 240, 230, 0.78)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: -8 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="relative flex flex-col items-center gap-4 rounded-[24px] border border-white/70 bg-[rgba(255,251,243,0.92)] px-8 py-7 shadow-[0_14px_38px_rgba(180,150,100,0.22)]"
            >
              <div
                className="relative grid h-[72px] w-[72px] place-items-center rounded-full"
                style={{ background: "radial-gradient(circle at 35% 30%, #FFD5C5 0%, #E99477 100%)" }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[-8px] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(199,93,62,0.35), transparent 65%)", filter: "blur(6px)" }}
                />
                <Heart className="heart-pulse relative h-9 w-9 fill-white text-white" strokeWidth={1.6} />
              </div>
              <div className="text-center">
                <p className="font-serif text-[20px] font-medium text-primary">已经收下</p>
                <p className="mt-1.5 font-garamond text-[13px] italic text-secondary">
                  小满会替你记着 · 在「回看 · 收下的预感」里
                </p>
              </div>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[rgba(212,165,116,0.14)] px-3 py-1 text-[11px] text-[var(--accent-deep)]">
                <Check className="h-3 w-3" strokeWidth={2} />
                正回到今日
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
