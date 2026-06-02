import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function PillInner({ text, interactive }: { text: string; interactive: boolean }) {
  return (
    <>
      {/* star mascot avatar */}
      <div className="relative h-[28px] w-[28px] shrink-0">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-3px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(232,182,101,0.34), transparent 65%)",
            animation: "glowPulse 2.6s ease-in-out infinite"
          }}
        />
        <Image
          src="/images/home/star-mascot.png"
          alt=""
          width={800}
          height={800}
          className="relative h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 2px 3px rgba(180,120,40,0.18))" }}
        />
      </div>

      <span className="relative font-medium text-[13px] text-primary">灵感AI</span>
      <span className="relative min-w-0 flex-1 truncate text-[13px] font-light text-secondary">{text}</span>

      {interactive ? (
        // tappable → a chevron makes the affordance explicit
        <ChevronRight className="relative h-4 w-4 shrink-0 text-tertiary" strokeWidth={1.6} aria-hidden="true" />
      ) : (
        // pure status → a tiny twinkle, clearly decorative
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="relative h-3 w-3 shrink-0"
          style={{ animation: "starTwinkle 2.4s ease-in-out infinite" }}
        >
          <defs>
            <radialGradient id="aiTwinkle" cx="50%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#FFF6D2" />
              <stop offset="50%" stopColor="#F2C26A" />
              <stop offset="100%" stopColor="#A8732E" />
            </radialGradient>
          </defs>
          <path
            d="M6 0.8 L7.1 4.5 L10.7 5.5 L7.1 6.5 L6 11.2 L4.9 6.5 L1.3 5.5 L4.9 4.5 Z"
            fill="url(#aiTwinkle)"
          />
        </svg>
      )}
    </>
  );
}

export function AIStatusPill({ text, href }: { text: string; href?: string }) {
  const base =
    "ai-pill relative flex items-center gap-2.5 overflow-hidden rounded-full border border-white/70 bg-[rgba(255,251,243,0.78)] px-3 py-2 shadow-[var(--card-shadow)] backdrop-blur-xl";

  if (href) {
    return (
      <Link href={href} className={`tap-soft ${base}`} aria-label={`小满状态：${text}`}>
        <PillInner text={text} interactive />
      </Link>
    );
  }

  return (
    <div className={base}>
      <PillInner text={text} interactive={false} />
    </div>
  );
}
