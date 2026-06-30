"use client";

import { useCart } from "@/lib/cart-context";

export default function Toast() {
  const { toast } = useCart();
  return (
    <div
      className={`fixed bottom-[100px] left-1/2 z-[300] -translate-x-1/2 rounded-full bg-black px-[22px] py-3 text-sm font-medium text-white transition-all ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      {toast}
    </div>
  );
}
