"use client";

import { useState, useEffect, useRef } from "react";
import type { MenuData } from "@/lib/types";
import { ItemCard } from "@/components/ui/ItemCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function MenuSection({ menu }: { menu: MenuData }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  function scrollToCategory(idx: number) {
    if (!menu.categories[idx]) return;
    const el = document.getElementById(`cat-${menu.categories[idx].slug}`);
    if (el) {
      const offset = 130;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActiveIdx(idx);
    const btn = tabsRef.current?.children[idx] as HTMLElement | undefined;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = menu.categories.findIndex((c) => `cat-${c.slug}` === entry.target.id);
            if (idx !== -1) {
              setActiveIdx(idx);
              const btn = tabsRef.current?.children[idx] as HTMLElement | undefined;
              btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    menu.categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [menu.categories]);

  return (
    <section id="menu" className="py-14 md:py-20" itemScope itemType="https://schema.org/Menu">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title="Our Menu"
          subtitle="100% pure veg · Cooked fresh daily · Pick and order on WhatsApp"
          centered
          className="mb-6"
        />

        {/* 100% Pure Veg assurance bar */}
        <div className="mb-6 flex items-center justify-center gap-6 rounded-2xl bg-green-50 px-5 py-3 ring-1 ring-green-100">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            100% Pure Vegetarian
          </span>
          <span className="text-[12px] text-green-700">🚫 No non-veg, ever</span>
          <span className="text-[12px] text-green-700">🌿 No artificial colours</span>
          <span className="text-[12px] text-green-700">✅ FSSAI Certified</span>
        </div>

        {/* Sticky category tabs */}
        <div className="sticky top-[68px] z-40 -mx-6 bg-white/70 px-6 pt-2 pb-3 backdrop-blur-lg">
          <div ref={tabsRef} className="no-scrollbar flex gap-2 overflow-x-auto">
            {menu.categories.map((cat, idx) => (
              <button
                key={cat.slug}
                onClick={() => scrollToCategory(idx)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  idx === activeIdx
                    ? "border-brand-red bg-brand-red text-white shadow-[0_6px_20px_rgba(211,47,47,0.35)]"
                    : "glass hover:border-brand-red/40 hover:text-brand-red border-white/50 text-neutral-700"
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category sections */}
        <div className="mt-8 flex flex-col gap-14">
          {menu.categories.map((cat) => (
            <div
              key={cat.slug}
              id={`cat-${cat.slug}`}
              className="scroll-mt-36"
              itemProp="hasMenuSection"
              itemScope
              itemType="https://schema.org/MenuSection"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="bg-brand-pink flex h-10 w-10 items-center justify-center rounded-xl text-[22px]">
                  {cat.emoji}
                </div>
                <h3 className="font-heading text-[20px] font-bold text-neutral-900" itemProp="name">
                  {cat.name}
                </h3>
                <span className="ml-auto text-[12px] font-medium text-neutral-400">
                  {cat.items.length} items
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    itemProp="hasMenuItem"
                    itemScope
                    itemType="https://schema.org/MenuItem"
                  >
                    <meta itemProp="name" content={item.name} />
                    <meta itemProp="description" content={item.description} />
                    <ItemCard item={item} categoryEmoji={cat.emoji} variant="horizontal" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
