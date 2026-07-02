"use client";

import { useCart } from "@/lib/cart-context";

export function DesktopCartBar() {
  const { totalQty, totalPrice, openCart } = useCart();

  if (totalQty === 0) return null;

  return (
    <button
      onClick={openCart}
      aria-label={`Open cart, ${totalQty} items, ₹${totalPrice}`}
      className="animate-fade-up shadow-red-lg bg-brand-red fixed right-6 bottom-6 z-[150] hidden items-center gap-3 rounded-full px-6 py-3.5 text-white transition-transform hover:-translate-y-0.5 md:flex"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[12px] font-bold">
        {totalQty > 9 ? "9+" : totalQty}
      </span>
      <span className="text-[14px] font-semibold">
        {totalQty === 1 ? "1 item" : `${totalQty} items`}
      </span>
      <span className="h-4 w-px bg-white/30" />
      <span className="text-[14px] font-bold">₹{totalPrice} · Checkout →</span>
    </button>
  );
}
