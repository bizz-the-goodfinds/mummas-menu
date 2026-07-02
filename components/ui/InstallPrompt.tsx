"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  trackPwaPromptShown,
  trackPwaInstallAccepted,
  trackPwaInstallDismissed,
} from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mummasMenuInstallDismissedAt";
const RESHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // re-prompt 7 days after a dismissal

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    if (dismissedAt && Date.now() - dismissedAt < RESHOW_AFTER_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
      trackPwaPromptShown();
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      trackPwaInstallAccepted();
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    trackPwaInstallDismissed();
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="install-prompt-surface animate-slide-down fixed top-[76px] right-4 left-4 z-[95] mx-auto flex max-w-[420px] items-center gap-3 rounded-2xl p-4 pr-9 shadow-xl md:top-[84px]">
      <button
        onClick={handleDismiss}
        aria-label="Close install prompt"
        className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-700"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="bg-brand-red flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <Image
          src="/images/logo/logo-icon-white.png"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Add to Home Screen</p>
        <p className="text-[12px] text-neutral-600">Order faster next time</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={handleDismiss}
          className="text-[12px] text-neutral-500 hover:text-neutral-700"
          aria-label="Dismiss install prompt"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="bg-brand-red rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
        >
          Install
        </button>
      </div>
    </div>
  );
}
