"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export default function Toast() {
  const { toast, totalQty } = useCart();
  return (
    <div
      className={`fixed left-1/2 z-[300] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-black py-2 pr-[22px] pl-2 text-sm font-medium whitespace-nowrap text-white transition-all ${
        totalQty > 0 ? "bottom-[140px] md:bottom-[100px]" : "bottom-[100px]"
      } ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
    >
      {toast && (
        <>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15">
            {toast.image ? (
              <Image
                src={toast.image}
                alt=""
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm leading-none">{toast.emoji}</span>
            )}
          </div>
          Added {toast.name}
        </>
      )}
    </div>
  );
}
