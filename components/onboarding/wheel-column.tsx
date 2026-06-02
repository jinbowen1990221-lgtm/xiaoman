"use client";

import { useEffect, useRef } from "react";

const ITEM_H = 36;
const VISIBLE = 5; // odd, so there's a clear center row
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

type WheelColumnProps<T extends string | number> = {
  label: string;
  values: T[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
};

export function WheelColumn<T extends string | number>({
  label,
  values,
  value,
  disabled = false,
  onChange
}: WheelColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<number | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const index = Math.max(0, values.findIndex((item) => item === value));

  // Keep the scroll position synced when the value changes (mount / tap / external).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTo({ top: target, behavior: "auto" });
    }
  }, [index]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || disabled) return;
    if (settleRef.current) window.clearTimeout(settleRef.current);
    // Debounce: wait for the flick to settle, then snap to the nearest row.
    settleRef.current = window.setTimeout(() => {
      const nextIndex = Math.min(
        values.length - 1,
        Math.max(0, Math.round(el.scrollTop / ITEM_H))
      );
      const nextValue = values[nextIndex];
      if (nextValue !== valueRef.current) onChange(nextValue);
    }, 120);
  }

  return (
    <div className={`relative flex-1 text-center ${disabled ? "opacity-35" : ""}`}>
      <p className="mb-2 text-[11px] text-tertiary">{label}</p>
      <div className="relative" style={{ height: VISIBLE * ITEM_H }}>
        {/* selection band on the centered row */}
        <div
          aria-hidden="true"
          className="border-y-hairline border-accent pointer-events-none absolute inset-x-0"
          style={{ top: PAD, height: ITEM_H }}
        />
        {/* top/bottom fade so off-center rows recede */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(180deg, var(--card-bg) 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 66%, var(--card-bg) 100%)"
          }}
        />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "y mandatory", paddingTop: PAD, paddingBottom: PAD }}
        >
          {values.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={`${item}`}
                type="button"
                disabled={disabled}
                onClick={() => onChange(item)}
                className={`flex w-full items-center justify-center font-serif transition-colors ${
                  active ? "text-xl font-medium text-primary" : "text-sm text-tertiary"
                }`}
                style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
