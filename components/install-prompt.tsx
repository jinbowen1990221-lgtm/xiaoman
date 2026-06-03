"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Share, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "xiaoman:a2hs";
const SNOOZE = 7 * 24 * 3600 * 1000; // don't nag again for a week after dismiss

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function InstallPrompt() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return undefined; // already installed — nothing to prompt

    try {
      const t = Number(window.localStorage.getItem(KEY) || 0);
      if (t && Date.now() - t < SNOOZE) return undefined;
    } catch {
      // ignore storage errors
    }

    const ua = navigator.userAgent || "";
    const ios = /iphone|ipad|ipod/i.test(ua);
    const android = /android/i.test(ua);
    if (!ios && !android) return undefined; // desktop — skip
    setPlatform(ios ? "ios" : "android");

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const timer = window.setTimeout(() => setShow(true), 2600);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.clearTimeout(timer);
    };
  }, []);

  // never interrupt the auth / onboarding flow
  if (pathname.startsWith("/login") || pathname.startsWith("/onboarding")) return null;

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  async function androidInstall() {
    if (!deferred) return;
    void deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      // ignore
    }
    dismiss();
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="关闭"
            onClick={dismiss}
            className="absolute inset-0 bg-[rgba(42,37,32,0.28)]"
          />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative mx-3 mb-3 w-full max-w-app rounded-[24px] border border-white/70 bg-[rgba(255,251,243,0.96)] px-5 pb-6 pt-5 shadow-[0_14px_40px_rgba(180,150,100,0.28)] backdrop-blur-xl"
            style={{ marginBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="关闭"
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-tertiary"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <div className="flex items-center gap-3">
              <Image
                src="/icon-192.png"
                alt="小满"
                width={192}
                height={192}
                className="h-12 w-12 rounded-[12px] shadow-[0_4px_10px_rgba(199,93,62,0.22)]"
              />
              <div className="min-w-0">
                <h2 className="font-serif text-[17px] font-medium text-primary">把小满放进主屏幕</h2>
                <p className="mt-0.5 font-garamond text-[12px] italic text-secondary">
                  像 App 一样打开，更安静、更顺手
                </p>
              </div>
            </div>

            {platform === "ios" ? (
              <div className="mt-4 space-y-2.5">
                <Step n={1}>
                  点屏幕<span className="text-primary">底部</span>的
                  <span className="mx-1 inline-flex items-center gap-1 rounded-md bg-[rgba(199,93,62,0.10)] px-1.5 py-0.5 text-[var(--accent-coral)]">
                    <Share className="h-3.5 w-3.5" strokeWidth={1.8} />
                    分享
                  </span>
                  按钮
                </Step>
                <Step n={2}>
                  在菜单里选
                  <span className="mx-1 inline-flex items-center gap-1 rounded-md bg-[rgba(199,93,62,0.10)] px-1.5 py-0.5 text-[var(--accent-coral)]">
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    添加到主屏幕
                  </span>
                </Step>
                <Step n={3}>回到主屏幕，点小满图标打开</Step>
              </div>
            ) : (
              <div className="mt-4">
                {deferred ? (
                  <button
                    type="button"
                    onClick={() => void androidInstall()}
                    className="bob-button-dark h-[50px] w-full text-[15px]"
                  >
                    一键添加到主屏幕
                  </button>
                ) : (
                  <p className="text-[13px] font-light leading-6 text-secondary">
                    点右上角浏览器菜单 ⋮ → 选择「添加到主屏幕 / 安装应用」。
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="mt-4 w-full text-center font-garamond text-[12px] italic text-tertiary"
            >
              以后再说
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-coral)] text-[11px] font-medium text-white">
        {n}
      </span>
      <p className="text-[13px] font-light leading-6 text-primary">{children}</p>
    </div>
  );
}
