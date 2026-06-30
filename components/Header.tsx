"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ brandName }: { brandName: string }) {
  const { totalQty, openCart } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const [first, second] = brandName.split(" ").length > 1
    ? [brandName.split(" ").slice(0, -1).join(" "), brandName.split(" ").slice(-1)[0]]
    : [brandName, ""];

  return (
    <header className="glass sticky top-0 z-[100] mx-3 mt-0 rounded-b-3xl">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-3xl" aria-hidden>
            🍲
          </span>
          <span className="font-heading font-bold text-lg leading-tight">
            {first} <br />
            <span className="text-brand-red">{second}</span>
          </span>
        </Link>

        <nav className={`nav-links ${navOpen ? "flex" : "hidden"} md:flex absolute md:static top-full left-3 right-3 mt-2 md:mt-0 flex-col md:flex-row gap-3.5 md:gap-7 glass-strong md:bg-transparent md:backdrop-blur-none md:border-0 md:shadow-none rounded-2xl p-4 md:p-0`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setNavOpen(false)}
              className="font-medium text-[15px] hover:text-brand-red transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative w-[42px] h-[42px] rounded-full glass flex items-center justify-center hover:-translate-y-0.5 transition-transform"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3H5L5.4 5M5.4 5H21L18 13H7M5.4 5L7 13M7 13L4.7 16.3C4.3 16.9 4.7 17.7 5.4 17.7H18M9 21C9.6 21 10 20.6 10 20C10 19.4 9.6 19 9 19C8.4 19 8 19.4 8 20C8 20.6 8.4 21 9 21ZM18 21C18.6 21 19 20.6 19 20C19 19.4 18.6 19 18 19C17.4 19 17 19.4 17 20C17 20.6 17.4 21 18 21Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[11px] font-bold w-[19px] h-[19px] rounded-full flex items-center justify-center">
                {totalQty}
              </span>
            )}
          </button>
          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="md:hidden w-[42px] h-[42px] rounded-full flex flex-col items-center justify-center gap-1.5"
          >
            <span className="w-[22px] h-[2px] bg-black rounded" />
            <span className="w-[22px] h-[2px] bg-black rounded" />
            <span className="w-[22px] h-[2px] bg-black rounded" />
          </button>
        </div>
      </div>
    </header>
  );
}
