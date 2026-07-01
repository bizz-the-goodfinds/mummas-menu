"use client";

import { useState } from "react";
import type { MenuData } from "@/lib/types";
import { ItemCard } from "@/components/ui/ItemCard";

export default function MenuSection({ menu }: { menu: MenuData }) {
  const [activeSlug, setActiveSlug] = useState<string>("all");

  const visibleCategories =
    activeSlug === "all" ? menu.categories : menu.categories.filter((c) => c.slug === activeSlug);

  return (
    <section id="menu" className="py-10 md:py-16" itemScope itemType="https://schema.org/Menu">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-brand-red mb-1 block text-[13px] font-semibold tracking-wider uppercase">
            100% Pure Veg · Cooked Fresh Daily
          </span>
          <h1 className="font-heading text-[28px] md:text-[36px]">Our Menu</h1>
        </div>

        {/* Pure Veg assurance */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-green-50 px-5 py-3 ring-1 ring-green-100">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            100% Pure Vegetarian
          </span>
          <span className="text-[12px] text-green-700">🚫 No non-veg, ever</span>
          <span className="text-[12px] text-green-700">🌿 No artificial colours</span>
          <span className="text-[12px] text-green-700">✅ FSSAI Certified</span>
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-[68px] z-40 -mx-6 bg-white/80 px-6 pt-3 pb-4 backdrop-blur-lg">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {/* All pill */}
            <button
              onClick={() => setActiveSlug("all")}
              className={`shrink-0 rounded-full border px-5 py-2 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                activeSlug === "all"
                  ? "border-brand-red bg-brand-red text-white shadow-[0_6px_20px_rgba(211,47,47,0.35)]"
                  : "hover:border-brand-red/40 hover:text-brand-red border-neutral-200 bg-white text-neutral-600"
              }`}
            >
              All
            </button>

            {menu.categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveSlug(cat.slug)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  activeSlug === cat.slug
                    ? "border-brand-red bg-brand-red text-white shadow-[0_6px_20px_rgba(211,47,47,0.35)]"
                    : "hover:border-brand-red/40 hover:text-brand-red border-neutral-200 bg-white text-neutral-600"
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category sections */}
        <div className="mt-8 flex flex-col gap-12">
          {visibleCategories.map((cat) => (
            <div
              key={cat.slug}
              id={`cat-${cat.slug}`}
              itemProp="hasMenuSection"
              itemScope
              itemType="https://schema.org/MenuSection"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="bg-brand-pink flex h-10 w-10 items-center justify-center rounded-xl text-[22px]">
                  {cat.emoji}
                </div>
                <h2 className="font-heading text-[22px] text-neutral-900" itemProp="name">
                  {cat.name}
                </h2>
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
