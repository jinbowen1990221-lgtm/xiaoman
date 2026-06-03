"use client";

import { CalendarDays, History, Mic, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const tabs: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: CalendarDays, label: "今日", href: "/" },
  { icon: Mic, label: "记录", href: "/record" },
  { icon: History, label: "回看", href: "/history" },
  { icon: User, label: "我", href: "/me" }
];

export function TabBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // iOS Safari places `fixed; bottom:0` behind the bottom toolbar. Lift the bar
  // by how much the toolbar overlaps = (full layout height) - (visible height).
  // The full layout height ≈ the largest window.innerHeight we ever see (i.e.
  // when the toolbar is collapsed). Clamped to a sane max so a bad reading can
  // never fling the bar into the middle of the page.
  useEffect(() => {
    const vv = window.visualViewport;
    const nav = navRef.current;
    if (!vv || !nav) return undefined;
    let maxH = window.innerHeight;
    const update = () => {
      maxH = Math.max(maxH, window.innerHeight);
      const overlap = Math.max(0, Math.min(140, Math.round(maxH - vv.height - vv.offsetTop)));
      nav.style.transform = overlap > 1 ? `translateY(${-overlap}px)` : "";
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-50 will-change-transform"
      style={{
        background: "rgba(255, 251, 243, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.72)",
        boxShadow: "0 -8px 24px rgba(180, 150, 100, 0.08)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="mx-auto flex max-w-app items-stretch justify-around px-2 pb-2 pt-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="group relative flex flex-1 flex-col items-center justify-start"
            >
              {/* icon chip */}
              <span
                className="grid h-[34px] w-[44px] place-items-center rounded-[13px] transition-all duration-300 ease-out"
                style={{
                  background: active ? "rgba(199, 93, 62, 0.12)" : "transparent",
                  transform: active ? "translateY(-1px)" : "translateY(0)"
                }}
              >
                <Icon
                  className="transition-all duration-300"
                  style={{
                    width: 21,
                    height: 21,
                    color: active ? "var(--accent-coral)" : "#A99A85",
                    strokeWidth: active ? 2.1 : 1.7,
                    fill: active ? "rgba(199, 93, 62, 0.14)" : "transparent"
                  }}
                />
              </span>

              {/* label — always visible */}
              <span
                className="mt-[5px] block text-[11px] leading-[14px] transition-colors duration-300"
                style={{
                  color: active ? "var(--accent-coral)" : "#9A8E7D",
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.04em"
                }}
              >
                {tab.label}
              </span>

              {/* active dot indicator */}
              <span
                aria-hidden="true"
                className="mt-[3px] h-[3px] w-[3px] rounded-full transition-all duration-300"
                style={{
                  background: "var(--accent-coral)",
                  opacity: active ? 1 : 0,
                  transform: active ? "scale(1)" : "scale(0)"
                }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
