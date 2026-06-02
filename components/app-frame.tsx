"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { TabBar } from "@/components/tab-bar";

const secondaryRoutes = [
  "/today/open",
  "/today/note",
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-dvh"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showTabBar ? <TabBar /> : null}
    </div>
  );
}
