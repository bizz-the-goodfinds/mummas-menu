"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { TagBadge } from "./Badge";
import { QtyButton } from "./QtyButton";
import { useCart } from "@/lib/cart-context";
import { trackViewItem } from "@/lib/analytics";

interface ItemDetailSheetProps {
  item: MenuItem;
  categoryEmoji: string;
  onClose: () => void;
}

export function ItemDetailSheet({ item, categoryEmoji, onClose }: ItemDetailSheetProps) {
  const { addItem, removeItem, qtyFor } = useCart();
  const qty = qtyFor(item.id);

  const handleAdd = () =>
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      emoji: categoryEmoji,
      image: item.image,
    });
  const handleRemove = () => removeItem(item.id);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    trackViewItem({ id: item.id, name: item.name, price: item.price });
  }, [item.id, item.name, item.price]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} aria-hidden />

      {/* Sheet / Modal */}
      <div
        role="dialog"
        aria-modal
        aria-label={item.name}
        className="glass-strong animate-fade-up relative w-full max-w-lg overflow-hidden rounded-t-[28px] md:rounded-[28px]"
      >
        {/* Image */}
        <div className="bg-brand-pink relative h-[220px] w-full md:h-[260px]">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 512px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[72px]">
              {categoryEmoji}
            </div>
          )}
          {/* Top-right close */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* Tag badges overlay */}
          {item.tags && item.tags.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {item.tags.map((t) => (
                <TagBadge key={t} tag={t} />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-[20px] leading-snug font-bold">{item.name}</h2>
            </div>
            <span className="font-heading text-brand-red shrink-0 text-[22px] font-bold">
              ₹{item.price}
            </span>
          </div>

          <p className="mb-6 text-[14px] leading-[1.7] text-neutral-600">{item.description}</p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {qty === 0 ? (
                <button
                  onClick={handleAdd}
                  className="bg-brand-red w-full rounded-full px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(211,47,47,0.35)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <QtyButton
                    qty={qty}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    itemName={item.name}
                  />
                  <span className="font-heading text-brand-red text-[18px] font-bold">
                    ₹{item.price * qty}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
