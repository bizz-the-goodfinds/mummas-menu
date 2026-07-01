"use client";

import { useEffect, useState } from "react";
import {
  trackPwaPromptShown,
  trackPwaInstallAccepted,
  trackPwaInstallDismissed,
} from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mummasMenuInstallDismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

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
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="glass-strong animate-fade-up fixed right-4 bottom-[72px] left-4 z-[180] flex items-center gap-3 rounded-2xl p-4 shadow-xl md:right-4 md:bottom-4 md:left-auto md:w-[340px]">
      <div className="bg-brand-red flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl">
        🍲
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
