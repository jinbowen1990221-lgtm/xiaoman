"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";

export function LogoutButton() {
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    // clear per-user client caches so the next account doesn't see stale data
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith("xiaoman:"))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-[14px] border border-[rgba(199,93,62,0.30)] bg-[rgba(255,251,243,0.66)] px-6 py-2.5 text-[14px] font-medium text-[var(--accent-coral)] shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform hover:scale-[1.02]"
    >
      退出登录
    </button>
  );
}
