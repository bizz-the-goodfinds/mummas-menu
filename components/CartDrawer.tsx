"use client";

import { useCart } from "@/lib/cart-context";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

export default function CartDrawer({
  brandName,
  whatsappNumber,
  siteUrl,
}: {
  brandName: string;
  whatsappNumber: string;
  siteUrl: string;
}) {
  const { lines, totalPrice, isOpen, closeCart, addItem, removeItem } = useCart();

  function handleCheckout() {
    const message = buildOrderMessage(brandName, lines, siteUrl);
    window.open(whatsappLink(whatsappNumber, message), "_blank", "noopener");
  }

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/35 z-[150] transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`glass fixed top-0 w-full max-w-[400px] h-full z-[200] flex flex-col rounded-l-3xl sm:rounded-l-3xl transition-[right] duration-300 ease-out ${
          isOpen ? "right-0" : "-right-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-[22px] border-b border-white/60">
          <h3 className="text-xl font-heading">Your Cart</h3>
          <button onClick={closeCart} aria-label="Close cart" className="text-xl w-9 h-9 flex items-center justify-center">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3.5">
          {lines.length === 0 ? (
            <div className="text-center text-neutral-500 py-16 text-sm">
              Your cart is empty.
              <br />
              Add some delicious items! 🍲
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="glass-strong rounded-2xl p-3 flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-xl bg-brand-pink flex items-center justify-center text-xl shrink-0">
                  {line.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold mb-1 truncate">{line.name}</h5>
                  <span className="text-brand-red font-bold text-[13px]">
                    ₹{line.price} × {line.qty} = ₹{line.price * line.qty}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(line.id)}
                    aria-label={`Remove one ${line.name}`}
                    className="w-[30px] h-[30px] rounded-full bg-brand-pink text-brand-red font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="font-bold min-w-4 text-center">{line.qty}</span>
                  <button
                    onClick={() => addItem(line)}
                    aria-label={`Add one more ${line.name}`}
                    className="w-[30px] h-[30px] rounded-full bg-brand-pink text-brand-red font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 pt-5 pb-[26px] border-t border-white/60">
          <div className="flex justify-between text-[17px] mb-4">
            <span>Total</span>
            <strong className="text-brand-red font-heading text-xl">₹{totalPrice}</strong>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full justify-center inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-[15px] bg-brand-red text-white shadow-[0_10px_24px_rgba(211,47,47,0.35)] hover:-translate-y-0.5 transition-transform"
          >
            <WhatsAppIcon />
            Checkout on WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}
