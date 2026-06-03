"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { InstallPrompt } from "@/components/install-prompt";
import { TabBar } from "@/components/tab-bar";

const secondaryRoutes = [
  "/today/open",
  "/today/note",
  "/today/reading",
  "/coin",
  "/lottery",
  "/login",
  "/onboarding",
  "/settings",
  "/history/record",
  "/history/note"
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showTabBar = !secondaryRoutes.some((route) => pathname.startsWith(route));

  return (
    <div className="app-container">
      {/* Decorative golden dust drifting behind everything */}
      <div className="gold-dust" aria-hidden="true" />
      <main className="min-h-dvh">{children}</main>
      {showTabBar ? <TabBar /> : null}
      <InstallPrompt />
    </div>
  );
}
