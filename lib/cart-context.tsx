"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartLine } from "./types";
import { haptic } from "./haptics";
import { trackAddToCart, trackRemoveFromCart, trackViewCart } from "./analytics";

const STORAGE_KEY = "mummasMenuCart";
const INSTRUCTIONS_KEY = "mummasMenuInstructions";

interface CartContextValue {
  lines: CartLine[];
  totalQty: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: {
    id: string;
    name: string;
    price: number;
    emoji: string;
    image?: string;
  }) => void;
  removeItem: (id: string) => void;
  qtyFor: (id: string) => number;
  clear: () => void;
  toast: { message: string; emoji?: string; image?: string } | null;
  notify: (message: string, opts?: { emoji?: string; image?: string }) => void;
  instructions: string;
  setInstructions: (v: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartLine>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, CartLine>) : {};
    } catch {
      return {};
    }
  });
  const [instructions, setInstructionsState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(INSTRUCTIONS_KEY) ?? "";
  });
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; emoji?: string; image?: string } | null>(
    null,
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((message: string, opts?: { emoji?: string; image?: string }) => {
    setToast({ message, emoji: opts?.emoji, image: opts?.image });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const setInstructions = useCallback((v: string) => {
    setInstructionsState(v);
    localStorage.setItem(INSTRUCTIONS_KEY, v);
  }, []);

  const addItem = useCallback(
    (item: { id: string; name: string; price: number; emoji: string; image?: string }) => {
      setCart((prev) => {
        const existing = prev[item.id];
        return {
          ...prev,
          [item.id]: {
            id: item.id,
            name: item.name,
            price: item.price,
            emoji: item.emoji,
            image: item.image,
            qty: (existing?.qty ?? 0) + 1,
          },
        };
      });
      setToast({ message: `Added ${item.name}`, emoji: item.emoji, image: item.image });
      haptic();
      trackAddToCart({ id: item.id, name: item.name, price: item.price });
    },
    [],
  );

  const removeItem = useCallback(
    (id: string) => {
      const existing = cart[id];
      if (existing) {
        haptic();
        trackRemoveFromCart({ id: existing.id, name: existing.name, price: existing.price });
      }
      setCart((prev) => {
        const line = prev[id];
        if (!line) return prev;
        const nextQty = line.qty - 1;
        const next = { ...prev };
        if (nextQty <= 0) {
          delete next[id];
        } else {
          next[id] = { ...line, qty: nextQty };
        }
        return next;
      });
    },
    [cart],
  );

  // Persist synchronously too: on checkout the page hands off to WhatsApp
  // immediately, and the async persist effect may never run before the tab is
  // suspended — leaving the old cart in localStorage.
  const clear = useCallback(() => {
    setCart({});
    try {
      localStorage.setItem(STORAGE_KEY, "{}");
    } catch {
      // storage unavailable — in-memory state is still cleared
    }
  }, []);

  const lines = useMemo(() => Object.values(cart), [cart]);
  const totalQty = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const totalPrice = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.price, 0), [lines]);
  const qtyFor = useCallback((id: string) => cart[id]?.qty ?? 0, [cart]);

  const openCart = useCallback(() => {
    setIsOpen(true);
    trackViewCart(
      totalPrice,
      lines.map((l) => ({ id: l.id, name: l.name, price: l.price, qty: l.qty })),
    );
  }, [totalPrice, lines]);

  const closeCart = useCallback(() => setIsOpen(false), []);

  const value: CartContextValue = {
    lines,
    totalQty,
    totalPrice,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    qtyFor,
    clear,
    toast,
    notify,
    instructions,
    setInstructions,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
