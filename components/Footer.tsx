import Image from "next/image";
import Link from "next/link";
import type { MenuData, SiteData } from "@/lib/types";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";

export default function Footer({ site, menu }: { site: SiteData; menu: MenuData }) {
  const waLink = whatsappLink(site.whatsappNumber, buildGeneralMessage(site));
  const todayHours = site.businessHours?.[0];

  return (
    <footer className="mt-16">
      {/* ── Main footer grid ── */}
      <div className="glass rounded-t-3xl border-t border-white/60 pb-[72px] md:pb-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-12 pb-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/logo/logo-icon-black.png"
                alt={site.brandName}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-heading text-[18px] leading-tight">{site.brandName}</span>
            </Link>
            <p className="max-w-[280px] text-[13px] leading-relaxed text-neutral-600">
              {site.tagline}
            </p>
            {todayHours && (
              <p className="text-[12px] text-neutral-500">
                ⏰ Open {todayHours.open} – {todayHours.close}
              </p>
            )}
            {site.deliveryNote && (
              <p className="text-[11px] text-neutral-600">{site.deliveryNote}</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-[13px] font-bold tracking-wider text-neutral-400 uppercase">
              Quick Links
            </h4>
            {[
              { href: "/", label: "Home" },
              { href: "/menu", label: "Full Menu" },
              { href: "/#about", label: "Our Story" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-brand-red text-[13px] text-neutral-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Menu categories */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-[13px] font-bold tracking-wider text-neutral-400 uppercase">
              Menu
            </h4>
            {menu.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/menu/${cat.slug}`}
                className="hover:text-brand-red text-[13px] text-neutral-600 transition-colors"
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-[13px] font-bold tracking-wider text-neutral-400 uppercase">
              Contact
            </h4>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-red flex items-center gap-1.5 text-[13px] text-neutral-600"
            >
              💬 Order on WhatsApp
            </a>
            <a
              href={`tel:+${site.whatsappNumber}`}
              className="hover:text-brand-red text-[13px] text-neutral-600"
            >
              📞 {site.phoneDisplay}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="hover:text-brand-red text-[13px] text-neutral-600"
            >
              ✉️ {site.email}
            </a>
            <span className="text-[13px] text-neutral-600">
              📍 {site.address.locality}, {site.address.region}
            </span>
            <div className="mt-1 flex gap-2">
              {site.social.instagram && (
                <SocialBtn href={site.social.instagram} label="Instagram">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                </SocialBtn>
              )}
              {site.social.facebook && (
                <SocialBtn href={site.social.facebook} label="Facebook">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
                  </svg>
                </SocialBtn>
              )}
              <SocialBtn href={waLink} label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5C10.3 9.6 9.9 8.4 9.7 8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3C3.9 14.9 3.4 13.5 3.4 12c0-4.7 3.9-8.6 8.6-8.6s8.6 3.9 8.6 8.6-3.9 8.6-8.6 8.6z" />
                </svg>
              </SocialBtn>
            </div>
          </div>
        </div>

        <div className="border-t border-white/60 px-6 py-5 text-center text-[12px] text-neutral-500">
          <p>
            © {new Date().getFullYear()} {site.brandName} · All rights reserved · 100% Pure Veg
            {" · "}
            FSSAI #{site.fssai?.licenceNumber ?? "—"}
            {" · "}
            Made with ❤️ in {site.address.locality}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="glass text-brand-red flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
    >
      {children}
    </a>
  );
}
