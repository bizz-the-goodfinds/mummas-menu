import Link from "next/link";
import type { SiteData } from "@/lib/types";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";

export default function Footer({ site }: { site: SiteData }) {
  const generalMsg = buildGeneralMessage(site.brandName, site.siteUrl);
  const waLink = whatsappLink(site.whatsappNumber, generalMsg);
  const [first, second] = site.brandName.split(" ").length > 1
    ? [site.brandName.split(" ").slice(0, -1).join(" "), site.brandName.split(" ").slice(-1)[0]]
    : [site.brandName, ""];

  return (
    <footer id="contact" className="mt-12 pt-14 glass border-t border-white/60 rounded-t-3xl">
      <div className="mx-auto max-w-6xl px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5 mb-2">
            <span className="text-3xl" aria-hidden>
              🍲
            </span>
            <span className="font-heading font-bold text-lg leading-tight">
              {first} <br />
              <span className="text-brand-red">{second}</span>
            </span>
          </Link>
          <p className="text-neutral-600 text-sm">{site.tagline}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold mb-1.5">Quick Links</h4>
          <Link href="/" className="text-sm text-neutral-700 hover:text-brand-red">
            Home
          </Link>
          <Link href="/menu" className="text-sm text-neutral-700 hover:text-brand-red">
            Menu
          </Link>
          <Link href="/about" className="text-sm text-neutral-700 hover:text-brand-red">
            About
          </Link>
          <Link href="/contact" className="text-sm text-neutral-700 hover:text-brand-red">
            Contact
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold mb-1.5">Contact</h4>
          <a href={waLink} target="_blank" rel="noopener" className="text-sm text-neutral-700 hover:text-brand-red">
            💬 WhatsApp Us
          </a>
          <a href={`tel:+${site.whatsappNumber}`} className="text-sm text-neutral-700 hover:text-brand-red">
            📞 {site.phoneDisplay}
          </a>
          <span className="text-sm text-neutral-700">📍 {site.address.locality}, serving fresh daily</span>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-base font-semibold mb-1.5">Follow Us</h4>
          <div className="flex gap-2.5">
            {site.social.instagram && (
              <SocialBtn href={site.social.instagram} label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </SocialBtn>
            )}
            {site.social.facebook && (
              <SocialBtn href={site.social.facebook} label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
                </svg>
              </SocialBtn>
            )}
            <SocialBtn href={waLink} label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
              </svg>
            </SocialBtn>
          </div>
        </div>
      </div>
      <div className="text-center py-[18px] text-[13px] text-neutral-600 border-t border-white/60">
        © {new Date().getFullYear()} {site.brandName}. All rights reserved.
      </div>
    </footer>
  );
}

function SocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="w-[38px] h-[38px] rounded-full glass flex items-center justify-center text-brand-red hover:-translate-y-0.5 transition-transform"
    >
      {children}
    </a>
  );
}
