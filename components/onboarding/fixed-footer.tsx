import type { ReactNode } from "react";

export function FixedFooter({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app">
      {/* soft fade so scrolling content doesn't bleed against the floating button */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[140px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,240,230,0) 0%, rgba(247,240,230,0.85) 45%, rgba(247,240,230,0.98) 100%)"
        }}
      />
      <footer className="pointer-events-auto relative px-5 pb-7 pt-2">{children}</footer>
    </div>
  );
}
