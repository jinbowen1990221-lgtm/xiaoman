"use client";

import { Heart, Infinity as InfinityIcon, Moon, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

// Custom "><" tired face icon — closed eyes + grimace mouth
function TiredFace({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" />
      {/* left eye — > shape */}
      <path d="M7.5 9.5 L9.2 10.8 L7.5 12" />
      {/* right eye — < shape */}
      <path d="M16.5 9.5 L14.8 10.8 L16.5 12" />
      {/* mouth — small grumpy oval */}
      <ellipse cx="12" cy="16" rx="2.2" ry="1.2" />
    </svg>
  );
}

type Mood = {
  key: string;
  label: string;
  icon: ReactNode | LucideIcon;
  hint: string;
};

const MOODS: Mood[] = [
  { key: "calm", label: "平静", icon: Moon, hint: "今天心里风平浪静" },
  { key: "warm", label: "暖意", icon: Heart, hint: "有一些被照顾到的瞬间" },
  { key: "tired", label: "有点累", icon: "tired-face", hint: "没关系，慢慢说就好" },
  { key: "tangled", label: "纠结", icon: InfinityIcon, hint: "把它放出来，会松一点" },
  { key: "spark", label: "灵光", icon: Sparkles, hint: "记下来，别让它溜走" }
];

export function MoodRow() {
  const [picked, setPicked] = useState<string | null>(null);
  const current = MOODS.find((m) => m.key === picked);

  return (
    <div className="mt-5">
      <p className="eyebrow mb-3">MOOD · 此刻的你</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MOODS.map((mood) => {
          const active = picked === mood.key;
          const color = active ? "var(--accent-coral)" : "#8A7E6E";
          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => setPicked(active ? null : mood.key)}
              className={`flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-[14px] border transition-all ${
                active
                  ? "border-[rgba(199,93,62,0.45)] bg-[rgba(255,250,240,0.92)] shadow-[0_6px_18px_rgba(199,93,62,0.18)]"
                  : "border-white/70 bg-[rgba(255,251,243,0.66)] shadow-[var(--card-shadow)] hover:scale-[1.03]"
              } backdrop-blur-xl`}
            >
              {mood.icon === "tired-face" ? (
                <TiredFace size={20} color={color} />
              ) : (
                (() => {
                  const Icon = mood.icon as LucideIcon;
                  return (
                    <Icon
                      style={{ color }}
                      size={20}
                      strokeWidth={1.6}
                    />
                  );
                })()
              )}
              <span
                className={`text-[11px] ${
                  active ? "text-[var(--accent-deep)] font-medium" : "text-secondary font-light"
                }`}
              >
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
      {current ? (
        <p className="mt-3 font-garamond text-[13px] italic text-[var(--accent-coral)]">
          — {current.hint}
        </p>
      ) : null}
    </div>
  );
}
