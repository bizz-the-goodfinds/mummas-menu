import type { Metadata } from "next";
import { getSiteData } from "@/lib/data";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `Contact Us — ${site.brandName}`,
    description: `Get in touch with ${site.brandName} on WhatsApp, phone, or social media. We're happy to help with your order.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const site = await getSiteData();
  const link = whatsappLink(site.whatsappNumber, buildGeneralMessage(site.brandName, site.siteUrl));

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="glass inline-block px-4 py-2 rounded-full text-[13px] font-semibold text-brand-red mb-4">
          Get In Touch
        </span>
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">We&apos;d love to hear from you</h1>
        <p className="text-neutral-600 mb-10 max-w-xl mx-auto">
          Questions about an order, bulk catering, or just want to say hi? Reach {site.brandName} directly on
          WhatsApp for the fastest response.
        </p>

        <div className="grid sm:grid-cols-3 gap-5">
          <ContactCard
            href={link}
            icon="💬"
            title="WhatsApp"
            value="Chat with us"
            external
          />
          <ContactCard href={`tel:+${site.whatsappNumber}`} icon="📞" title="Call" value={site.phoneDisplay} />
          <ContactCard href={`mailto:${site.email}`} icon="📧" title="Email" value={site.email} />
        </div>

        <div className="glass rounded-3xl p-8 mt-10 text-left">
          <h2 className="font-heading text-xl mb-3">📍 Where we deliver</h2>
          <p className="text-neutral-700">
            {site.address.locality}
            {site.address.region ? `, ${site.address.region}` : ""} — fresh, home-cooked meals delivered daily.
          </p>
          <h2 className="font-heading text-xl mt-6 mb-3">🕒 Hours</h2>
          <p className="text-neutral-700">{site.hours}</p>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  href,
  icon,
  title,
  value,
  external,
}: {
  href: string;
  icon: string;
  title: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      className="glass rounded-3xl p-6 flex flex-col items-center gap-2 hover:-translate-y-1 transition-transform"
    >
      <span className="text-3xl">{icon}</span>
      <strong className="font-heading">{title}</strong>
      <span className="text-sm text-neutral-600 break-all">{value}</span>
    </a>
  );
}
