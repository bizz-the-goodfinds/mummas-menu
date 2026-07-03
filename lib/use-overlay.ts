"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Shared behaviour for full-screen overlays (cart drawer, mobile nav, item sheet):
 *
 * 1. Locks body scroll while open so the page behind the overlay doesn't scroll.
 * 2. Pushes a history entry on open so the browser/PWA back gesture closes the
 *    overlay instead of leaving the page (or exiting the installed app).
 *
 * Returns `requestClose` — close buttons/backdrops should call it instead of
 * closing state directly, so the history entry pushed on open is consumed by
 * the same `history.back()` path the back gesture uses.
 */
export function useOverlay(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.history.pushState({ overlay: true }, "");
    const onPop = () => onCloseRef.current();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  return useCallback(() => {
    if (window.history.state?.overlay) window.history.back();
    else onCloseRef.current();
  }, []);
}
