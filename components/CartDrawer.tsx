"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { QtyButton } from "@/components/ui/QtyButton";
import type { MenuData, SiteData } from "@/lib/types";

export default function CartDrawer({ site, menu }: { site: SiteData; menu?: MenuData }) {
  const {
    lines,
    totalPrice,
    isOpen,
    closeCart,
    addItem,
    removeItem,
    instructions,
    setInstructions,
  } = useCart();

  function handleCheckout() {
    const message = buildOrderMessage(site, lines, instructions);
    window.open(whatsappLink(site.whatsappNumber, message), "_blank", "noopener");
    fetch("/api/content/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lines, total: totalPrice, source: site.orderSource }),
    }).catch(() => {});
  }

  // "You might also like" — items not already in cart, from all categories
  const cartIds = new Set(lines.map((l) => l.id));
  const suggestions =
    menu?.categories
      .flatMap((cat) => cat.items.map((item) => ({ item, emoji: cat.emoji })))
      .filter(({ item }) => !cartIds.has(item.id))
      .slice(0, 4) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-[150] bg-black/40 transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Shopping cart"
        className={`glass fixed top-0 z-[200] flex h-full w-full max-w-[420px] flex-col rounded-l-3xl transition-[right] duration-300 ease-out ${isOpen ? "right-0" : "-right-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <div>
            <h2 className="font-heading text-[19px] font-bold">Your Cart</h2>
            {lines.length > 0 && (
              <p className="mt-0.5 text-[12px] text-neutral-500">
                {lines.reduce((s, l) => s + l.qty, 0)} items · 100% Pure Veg 🌿
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="glass hover:text-brand-red flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors"
          >
            <svg
              width="16"
              height="16"
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
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <>
              {/* Cart lines */}
              {lines.map((line) => (
                <div key={line.id} className="glass-strong flex items-center gap-3 rounded-2xl p-3">
                  <div className="bg-brand-pink h-[54px] w-[54px] shrink-0 overflow-hidden rounded-xl">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.name}
                        width={54}
                        height={54}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">
                        {line.emoji}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="mb-0.5 truncate text-[13px] font-semibold">{line.name}</h5>
                    <span className="text-brand-red text-[13px] font-bold">
                      ₹{line.price} × {line.qty}{" "}
                      <span className="font-normal text-neutral-500">= </span>
                      <strong>₹{line.price * line.qty}</strong>
                    </span>
                  </div>
                  <div className="shrink-0">
                    <QtyButton
                      qty={line.qty}
                      onAdd={() =>
                        addItem({
                          id: line.id,
                          name: line.name,
                          price: line.price,
                          emoji: line.emoji,
                          image: line.image,
                        })
                      }
                      onRemove={() => removeItem(line.id)}
                      itemName={line.name}
                      size="sm"
                    />
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div className="mt-1">
                <label className="mb-1.5 block text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Special Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Extra butter, less spice, no onion…"
                  rows={2}
                  maxLength={300}
                  className="focus:ring-brand-red/30 w-full resize-none rounded-xl border border-white/60 bg-white/60 px-3 py-2.5 text-[13px] backdrop-blur-sm placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
                />
              </div>

              {/* You might also like */}
              {suggestions.length > 0 && (
                <div className="mt-1">
                  <p className="mb-2 text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
                    You might also like
                  </p>
                  <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                    {suggestions.map(({ item, emoji }) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          addItem({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            emoji,
                            image: item.image,
                          })
                        }
                        className="glass-strong hover:ring-brand-red/30 flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition-all hover:ring-2"
                      >
                        <div className="bg-brand-pink h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-base">
                              {emoji}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="w-[100px] truncate text-[11px] leading-snug font-semibold">
                            {item.name}
                          </p>
                          <p className="text-brand-red text-[11px] font-bold">₹{item.price}</p>
                        </div>
                        <span className="text-brand-red ml-1 text-[18px] leading-none font-bold">
                          +
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="border-t border-white/60 px-6 pt-4 pb-6">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[14px] text-neutral-600">Subtotal</span>
              <strong className="font-heading text-brand-red text-[22px]">₹{totalPrice}</strong>
            </div>
            <p className="mb-4 text-[11px] text-neutral-400">
              {site.deliveryNote ?? "Delivery charges & payment details shared on WhatsApp"}
            </p>
            <button
              onClick={handleCheckout}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <WhatsAppIcon />
              Checkout on WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="bg-brand-pink flex h-20 w-20 items-center justify-center rounded-full text-4xl">
        🛒
      </div>
      <div>
        <p className="font-heading text-[16px] font-semibold">Your cart is empty</p>
        <p className="mt-1 text-[13px] text-neutral-500">Add some delicious homestyle food!</p>
      </div>
      <button
        onClick={onClose}
        className="bg-brand-red mt-1 rounded-full px-6 py-2.5 text-[14px] font-semibold text-white"
      >
        Browse Menu →
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5C10.3 9.6 9.9 8.4 9.7 8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3C3.9 14.9 3.4 13.5 3.4 12c0-4.7 3.9-8.6 8.6-8.6s8.6 3.9 8.6 8.6-3.9 8.6-8.6 8.6z" />
    </svg>
  );
}
