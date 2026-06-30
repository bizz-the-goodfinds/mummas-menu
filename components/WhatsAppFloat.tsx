import type { SiteData } from "@/lib/types";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";

export default function WhatsAppFloat({ site }: { site: SiteData }) {
  const link = whatsappLink(site.whatsappNumber, buildGeneralMessage(site.brandName, site.siteUrl));
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener"
      aria-label="Order on WhatsApp"
      className="fixed bottom-[26px] right-[26px] w-[58px] h-[58px] rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-[0_10px_26px_rgba(37,211,102,0.45)] z-[90] animate-pulse-glow"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    </a>
  );
}
