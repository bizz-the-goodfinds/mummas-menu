"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function CategoryItemList({ emoji, items }: { emoji: string; items: MenuItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
      {items.map((item) => (
        <ItemCard key={item.id} emoji={emoji} item={item} />
      ))}
    </div>
  );
}

function ItemCard({ emoji, item }: { emoji: string; item: MenuItem }) {
  const { qtyFor, addItem, removeItem } = useCart();
  const qty = qtyFor(item.id);

  return (
    <div className="glass rounded-3xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3.5">
        <div className="w-[52px] h-[52px] rounded-2xl bg-brand-pink flex items-center justify-center text-3xl shrink-0 overflow-hidden">
          {item.image ? (
            <Image src={item.image} alt={item.name} width={52} height={52} className="object-cover w-full h-full" />
          ) : (
            <span aria-hidden>{emoji}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15.5px] font-semibold mb-1">{item.name}</h3>
          <span className="text-brand-red font-bold font-heading">₹{item.price}</span>
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
      {item.description && <p className="text-[13px] text-neutral-600 leading-relaxed">{item.description}</p>}
    </div>
  );
}
