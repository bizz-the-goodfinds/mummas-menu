"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuData } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function MenuSection({ menu }: { menu: MenuData }) {
  const [activeIdx, setActiveIdx] = useState(0);

  function scrollToCategory(idx: number) {
    document.getElementById(`cat-${menu.categories[idx].slug}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveIdx(idx);
  }

  return (
    <section id="menu" className="py-16 md:py-[70px]" itemScope itemType="https://schema.org/Menu">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-9">
          <h2 className="font-heading font-bold text-[26px] md:text-[34px] mb-2">Our Menu</h2>
          <p className="text-neutral-600">Freshly cooked, homestyle favourites — pick your category</p>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-6 pt-1.5">
          {menu.categories.map((cat, idx) => (
            <button
              key={cat.slug}
              onClick={() => scrollToCategory(idx)}
              className={`shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm border transition-all hover:-translate-y-0.5 ${
                idx === activeIdx
                  ? "bg-brand-red text-white border-brand-red"
                  : "glass text-black"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-12">
          {menu.categories.map((cat) => (
            <div
              key={cat.slug}
              id={`cat-${cat.slug}`}
              className="scroll-mt-28"
              itemProp="hasMenuSection"
              itemScope
              itemType="https://schema.org/MenuSection"
            >
              <h3 className="font-heading text-2xl mb-[18px] flex items-center gap-2.5 text-brand-red" itemProp="name">
                <span>{cat.emoji}</span> {cat.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                {cat.items.map((item) => (
                  <MenuItemCard key={item.id} emoji={cat.emoji} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuItemCard({
  emoji,
  item,
}: {
  emoji: string;
  item: { id: string; name: string; price: number; description: string; image: string };
}) {
  const { qtyFor, addItem, removeItem } = useCart();
  const qty = qtyFor(item.id);

  return (
    <div
      className="glass rounded-3xl p-5 flex items-center gap-3.5 hover:-translate-y-1 transition-transform"
      itemProp="hasMenuItem"
      itemScope
      itemType="https://schema.org/MenuItem"
    >
      <div className="w-[52px] h-[52px] rounded-2xl bg-brand-pink flex items-center justify-center text-3xl shrink-0 overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} width={52} height={52} className="object-cover w-full h-full" />
        ) : (
          <span aria-hidden>{emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[15.5px] font-semibold mb-1" itemProp="name">
          {item.name}
        </h4>
        <span
          className="text-brand-red font-bold font-heading"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <meta itemProp="priceCurrency" content="INR" />
          <meta itemProp="price" content={String(item.price)} />₹{item.price}
        </span>
      </div>

      {qty > 0 ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => removeItem(item.id)}
            aria-label={`Remove one ${item.name}`}
            className="w-[30px] h-[30px] rounded-full bg-brand-pink text-brand-red font-bold flex items-center justify-center"
          >
            −
          </button>
          <span className="font-bold min-w-4 text-center">{qty}</span>
          <button
            onClick={() => addItem({ id: item.id, name: item.name, price: item.price, emoji })}
            aria-label={`Add one more ${item.name}`}
            className="w-[30px] h-[30px] rounded-full bg-brand-pink text-brand-red font-bold flex items-center justify-center"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={() => addItem({ id: item.id, name: item.name, price: item.price, emoji })}
          aria-label={`Add ${item.name} to cart`}
          className="w-[38px] h-[38px] rounded-full bg-brand-red text-white text-xl font-bold flex items-center justify-center shrink-0 active:scale-90 transition-transform"
        >
          +
        </button>
      )}
    </div>
  );
}
