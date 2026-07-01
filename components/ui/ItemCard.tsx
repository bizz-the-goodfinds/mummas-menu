"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { MenuItem } from "@/lib/types";
import { TagBadge } from "./Badge";
import { QtyButton } from "./QtyButton";
import { ItemDetailSheet } from "./ItemDetailSheet";

interface ItemCardProps {
  item: MenuItem;
  categoryEmoji: string;
  variant?: "horizontal" | "grid";
}

export function ItemCard({ item, categoryEmoji, variant = "horizontal" }: ItemCardProps) {
  const { addItem, removeItem, qtyFor } = useCart();
  const qty = qtyFor(item.id);
  const [detailOpen, setDetailOpen] = useState(false);

  const doAdd = () =>
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      emoji: categoryEmoji,
      image: item.image,
    });
  const doRemove = () => removeItem(item.id);

  if (variant === "grid") {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setDetailOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}
          className="glass group flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-xl"
          aria-label={`View ${item.name} details`}
        >
          <div className="bg-brand-pink relative aspect-[4/3] w-full overflow-hidden">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">
                {categoryEmoji}
              </div>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {item.tags.map((t) => (
                  <TagBadge key={t} tag={t} />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-[14px] leading-snug font-semibold">{item.name}</h3>
              </div>
              <span className="font-heading text-brand-red shrink-0 text-[15px] font-bold">
                ₹{item.price}
              </span>
            </div>
            <p className="line-clamp-2 flex-1 text-[12px] leading-snug text-neutral-500">
              {item.description}
            </p>
            {/* Stop propagation so qty stepper doesn't trigger detail sheet */}
            <div
              className="mt-auto flex justify-end"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <QtyButton
                qty={qty}
                onAdd={doAdd}
                onRemove={doRemove}
                itemName={item.name}
                size="sm"
              />
            </div>
          </div>
        </div>
        {detailOpen && (
          <ItemDetailSheet
            item={item}
            categoryEmoji={categoryEmoji}
            onClose={() => setDetailOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}
        className="glass group flex cursor-pointer gap-3 rounded-2xl p-3 transition-shadow duration-300 hover:shadow-lg"
        aria-label={`View ${item.name} details`}
      >
        <div className="bg-brand-pink relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-xl">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="90px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              {categoryEmoji}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.tags?.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
          <h3 className="text-[14px] leading-snug font-semibold">{item.name}</h3>
          <p className="line-clamp-2 text-[12px] leading-snug text-neutral-500">
            {item.description}
          </p>
          <div
            className="mt-auto flex items-center justify-between pt-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="font-heading text-brand-red text-[15px] font-bold">₹{item.price}</span>
            <QtyButton qty={qty} onAdd={doAdd} onRemove={doRemove} itemName={item.name} size="sm" />
          </div>
        </div>
      </div>
      {detailOpen && (
        <ItemDetailSheet
          item={item}
          categoryEmoji={categoryEmoji}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
