import type { ReactNode } from "react";

export function FixedFooter({ children }: { children: ReactNode }) {
  return <footer className="fixed inset-x-0 bottom-8 z-10 mx-auto max-w-app px-5">{children}</footer>;
}
