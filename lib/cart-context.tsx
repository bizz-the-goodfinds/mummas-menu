"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartLine } from "./types";
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
  toast: { name: string; emoji: string; image?: string } | null;
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
  const [toast, setToast] = useState<{ name: string; emoji: string; image?: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

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
      setToast({ name: item.name, emoji: item.emoji, image: item.image });
      trackAddToCart({ id: item.id, name: item.name, price: item.price });
    },
    [],
  );

  const removeItem = useCallback(
    (id: string) => {
      const existing = cart[id];
      if (existing) {
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

  const clear = useCallback(() => setCart({}), []);

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

  const value: CartContextValue = {
    lines,
    totalQty,
    totalPrice,
    isOpen,
    openCart,
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    qtyFor,
    clear,
    toast,
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
