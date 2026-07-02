"use client";

import type { SiteData } from "@/lib/types";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { trackWhatsAppFloat } from "@/lib/analytics";
import { useCart } from "@/lib/cart-context";

export default function WhatsAppFloat({ site }: { site: SiteData }) {
  const { totalQty } = useCart();
  const link = whatsappLink(site.whatsappNumber, buildGeneralMessage(site));

  // Lift the button clear of the checkout bar (mobile: BottomNav's checkout
  // strip, desktop: DesktopCartBar) whenever the cart isn't empty.
  const bottomOffset =
    totalQty > 0
      ? "bottom-[calc(112px+env(safe-area-inset-bottom))] md:bottom-[100px]"
      : "bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-[26px]";

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener"
      aria-label="Order on WhatsApp"
      onClick={() => trackWhatsAppFloat()}
      className={`animate-pulse-glow fixed right-[18px] z-[80] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_26px_rgba(37,211,102,0.45)] transition-[bottom] duration-200 md:right-[26px] ${bottomOffset}`}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    </a>
  );
}
