"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { MenuData } from "@/lib/types";

interface CategoryFilterProps {
  categories: MenuData["categories"];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function CategoryFilter({ categories, activeSlug, onSelect }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // The trigger sits inside a `backdrop-blur` sticky bar, which creates a CSS
  // containing block for fixed-position descendants — so the sheet
  // is portaled to <body> to escape it and stay truly viewport-fixed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const options = [
    { slug: "all", name: "All", emoji: "🍽️" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji })),
  ];
  const active = options.find((o) => o.slug === activeSlug) ?? options[0];

  function handleSelect(slug: string) {
    onSelect(slug);
    setOpen(false);
  }

  return (
    <div className="relative md:min-w-0 md:flex-1">
      {/* Mobile: dropdown trigger opening a bottom sheet */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-brand-black/30 text-brand-black flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-[13px] font-semibold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 md:hidden"
      >
        <span>{active.emoji}</span>
        {active.name}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Desktop: full row of category pills, no dropdown needed */}
      <div className="relative hidden min-w-0 md:block">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {options.map((o) => (
            <button
              key={o.slug}
              aria-pressed={o.slug === activeSlug}
              onClick={() => onSelect(o.slug)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 active:scale-95 ${
                o.slug === activeSlug
                  ? "border-brand-red bg-brand-red shadow-red text-white"
                  : "border-brand-black/15 text-brand-black bg-white"
              }`}
            >
              <span>{o.emoji}</span>
              {o.name}
            </button>
          ))}
        </div>
        {/* Fade hint that the row scrolls when it overflows */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white/80 to-transparent" />
      </div>

      {open &&
        mounted &&
        createPortal(
          <>
            {/* Backdrop scrim behind the mobile sheet */}
            <div
              onClick={() => setOpen(false)}
              aria-hidden
              className="fixed inset-0 z-[110] bg-black/40"
            />

            {/* Mobile: bottom sheet */}
            <div
              role="listbox"
              aria-label="Filter by category"
              className="animate-slide-up-sheet fixed inset-x-0 bottom-0 z-[120] rounded-t-3xl bg-white p-4 shadow-2xl"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
              <p className="mb-3 px-1 text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
                Filter by category
              </p>
              <div className="flex flex-col gap-1">
                {options.map((o) => (
                  <button
                    key={o.slug}
                    role="option"
                    aria-selected={o.slug === activeSlug}
                    onClick={() => handleSelect(o.slug)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-medium transition-colors ${
                      o.slug === activeSlug
                        ? "text-brand-black bg-neutral-100"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-lg">{o.emoji}</span>
                    {o.name}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
