"use client";

import { useEffect, useState } from "react";

function todayKey() {
  // date in Beijing time, e.g. "2026-06-02"
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

/**
 * Today's note. Shows the grounded fallback instantly (no loading flash), then
 * silently upgrades to the AI-written version and caches it for the day, so the
 * model is called at most once per day per device.
 */
export function TodayNoteText({ fallback }: { fallback: string }) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    const key = `xiaoman:today-note:${todayKey()}`;
    try {
      const cached = window.localStorage.getItem(key);
      if (cached) {
        setText(cached);
        return;
      }
    } catch {
      // storage unavailable — fall through to fetch
    }

    let cancelled = false;
    fetch("/api/today-note")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { text?: string } | null) => {
        if (cancelled || !data?.text) return;
        setText(data.text);
        try {
          window.localStorage.setItem(key, data.text);
        } catch {
          // ignore
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{text}</>;
}
