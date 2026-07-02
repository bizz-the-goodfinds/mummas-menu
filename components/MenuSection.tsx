"use client";

import { useState } from "react";
import type { MenuData } from "@/lib/types";
import { ItemCard } from "@/components/ui/ItemCard";
import { CategoryFilter } from "@/components/ui/CategoryFilter";

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

        {/* Sticky filter bar */}
        <div className="sticky top-[68px] z-40 -mx-6 flex items-center justify-between bg-white/80 px-6 pt-3 pb-4 backdrop-blur-lg">
          <CategoryFilter
            categories={menu.categories}
            activeSlug={activeSlug}
            onSelect={setActiveSlug}
          />
          <span className="text-[12px] font-medium text-neutral-400">
            {visibleCategories.reduce((sum, c) => sum + c.items.length, 0)} items
          </span>
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
                    className="h-full"
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
