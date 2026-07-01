"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const NAV = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/menu",
    label: "Menu",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const CartIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3H5L5.4 5M5.4 5H21L18 13H7M5.4 5L7 13M7 13L4.7 16.3C4.3 16.9 4.7 17.7 5.4 17.7H18M9 21C9.6 21 10 20.6 10 20C10 19.4 9.6 19 9 19C8.4 19 8 19.4 8 20C8 20.6 8.4 21 9 21ZM18 21C18.6 21 19 20.6 19 20C19 19.4 18.6 19 18 19C17.4 19 17 19.4 17 20C17 20.6 17.4 21 18 21Z" />
  </svg>
);

export function BottomNav() {
  const pathname = usePathname();
  const { totalQty, totalPrice, openCart } = useCart();

  const handleCartClick = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }
    openCart();
  };

  return (
    <nav className="safe-area-bottom fixed right-0 bottom-0 left-0 z-[90] border-t border-white/60 bg-white/90 backdrop-blur-xl md:hidden">
      {/* Checkout strip — shown when cart has items */}
      {totalQty > 0 && (
        <button
          onClick={handleCartClick}
          className="bg-brand-red flex w-full items-center justify-between px-5 py-2.5"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-[11px] font-bold">
              {totalQty}
            </span>
            {totalQty === 1 ? "1 item" : `${totalQty} items`} in cart
          </span>
          <span className="text-[13px] font-bold text-white">₹{totalPrice} · Checkout →</span>
        </button>
      )}

      {/* Nav tabs */}
      <div className="flex items-center">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-brand-red" : "text-neutral-500"
              }`}
            >
              <span className={active ? "text-brand-red" : "text-neutral-400"}>{icon}</span>
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleCartClick}
          className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
            totalQty > 0 ? "text-brand-red" : "text-neutral-500"
          }`}
          aria-label="Open cart"
        >
          <span className={`relative ${totalQty > 0 ? "text-brand-red" : "text-neutral-400"}`}>
            <CartIcon />
            {totalQty > 0 && (
              <span className="bg-brand-red absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white">
                {totalQty > 9 ? "9+" : totalQty}
              </span>
            )}
          </span>
          Cart
        </button>
      </div>
    </nav>
  );
}
