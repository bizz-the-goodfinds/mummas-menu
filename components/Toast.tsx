"use client";

import { useCart } from "@/lib/cart-context";

export default function Toast() {
  const { toast } = useCart();
  return (
    <div
      className={`fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-black text-white px-[22px] py-3 rounded-full text-sm font-medium z-[300] transition-all ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
      }`}
    >
      {toast}
    </div>
  );
}
