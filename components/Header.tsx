"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { FssaiBadge } from "@/components/ui/Badge";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ brandName }: { brandName: string }) {
  const { totalQty, openCart } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setNavOpen(false);
  }

  const [first, ...rest] = brandName.split(" ");
  const second = rest.join(" ");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass sticky top-0 z-[100] mx-3 mt-2 rounded-2xl transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="text-[28px]" aria-hidden>
            🍲
          </span>
          <div>
            <span className="font-heading block text-[17px] leading-tight font-bold">
              {first} <span className="text-brand-red">{second}</span>
            </span>
            <FssaiBadge compact />
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`after:bg-brand-red relative text-[14px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:transition-all after:duration-200 ${
                  active
                    ? "text-brand-red after:w-full"
                    : "hover:text-brand-red text-neutral-700 after:w-0 hover:after:w-full"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            aria-label={`Open cart, ${totalQty} items`}
            className="glass relative flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3H5L5.4 5M5.4 5H21L18 13H7M5.4 5L7 13M7 13L4.7 16.3C4.3 16.9 4.7 17.7 5.4 17.7H18M9 21C9.6 21 10 20.6 10 20C10 19.4 9.6 19 9 19C8.4 19 8 19.4 8 20C8 20.6 8.4 21 9 21ZM18 21C18.6 21 19 20.6 19 20C19 19.4 18.6 19 18 19C17.4 19 17 19.4 17 20C17 20.6 17.4 21 18 21Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totalQty > 0 && (
              <span className="bg-brand-red absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white">
                {totalQty > 9 ? "9+" : totalQty}
              </span>
            )}
          </button>

          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            className="glass flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full md:hidden"
          >
            <span
              className={`bg-brand-black h-[2px] w-[18px] origin-center rounded transition-all duration-300 ${navOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`bg-brand-black h-[2px] w-[18px] rounded transition-all duration-300 ${navOpen ? "scale-x-0 opacity-0" : ""}`}
            />
            <span
              className={`bg-brand-black h-[2px] w-[18px] origin-center rounded transition-all duration-300 ${navOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {navOpen && (
        <nav
          className="glass-strong flex flex-col gap-1 rounded-b-2xl border-t border-white/60 px-5 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setNavOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  active
                    ? "text-brand-red bg-brand-pink"
                    : "hover:text-brand-red hover:bg-brand-pink/50 text-neutral-700"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
