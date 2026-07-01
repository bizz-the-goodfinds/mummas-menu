import type { Metadata } from "next";
import { getSiteData } from "@/lib/data";
import { buildGeneralMessage, buildSupportMessage, whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  const description = `Get in touch with ${site.brandName} on WhatsApp, phone, or social media. We're happy to help with your order.`;
  return {
    title: `Contact Us — ${site.brandName}`,
    description,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: `Contact Us — ${site.brandName}`,
      description,
      url: `${site.siteUrl}/contact`,
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Contact Us — ${site.brandName}`,
      description,
      images: [site.ogImage],
    },
  };
}

export default async function ContactPage() {
  const site = await getSiteData();
  const link = whatsappLink(site.whatsappNumber, buildGeneralMessage(site));
  const trackLink = whatsappLink(site.whatsappNumber, buildSupportMessage(site, "track"));
  const complaintLink = whatsappLink(site.whatsappNumber, buildSupportMessage(site, "complaint"));
  const feedbackLink = whatsappLink(site.whatsappNumber, buildSupportMessage(site, "feedback"));

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="glass text-brand-red mb-4 inline-block rounded-full px-4 py-2 text-[13px] font-semibold">
          Get In Touch
        </span>
        <h1 className="font-heading mb-4 text-3xl font-bold md:text-4xl">
          We&apos;d love to hear from you
        </h1>
        <p className="mx-auto mb-3 max-w-xl text-neutral-600">
          Questions about an order, bulk catering, or just want to say hi? Reach {site.brandName}{" "}
          directly on WhatsApp for the fastest response.
        </p>
        <span className="mb-10 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-[12px] font-semibold text-green-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          {site.support.responseTime}
        </span>

        <div className="grid gap-5 sm:grid-cols-3">
          <ContactCard href={link} icon="💬" title="WhatsApp" value="Chat with us" external />
          <ContactCard
            href={`tel:+${site.whatsappNumber}`}
            icon="📞"
            title="Call"
            value={site.phoneDisplay}
          />
          <ContactCard href={`mailto:${site.email}`} icon="📧" title="Email" value={site.email} />
        </div>

        <div className="glass mt-10 rounded-3xl p-8 text-left">
          <h2 className="font-heading mb-4 text-xl">🙋 Customer Support</h2>
          <p className="mb-5 text-neutral-700">
            Already placed an order, or had an issue? Use one of these pre-filled WhatsApp messages
            so we can help you faster.
          </p>
          <div className="flex flex-wrap gap-3">
            <SupportButton href={trackLink} label="📦 Track my order" />
            <SupportButton href={complaintLink} label="⚠️ Report an issue" />
            <SupportButton href={feedbackLink} label="⭐ Share feedback" />
          </div>
        </div>

        <div className="glass mt-6 rounded-3xl p-8 text-left">
          <h2 className="font-heading mb-3 text-xl">📍 Where we deliver</h2>
          <p className="text-neutral-700">
            {site.deliveryArea} — fresh, home-cooked meals, freshly made daily. Self-pickup is
            available now; for delivery we book a trusted partner rider (Porter/Uber) on your
            behalf, with our own delivery service launching soon.
          </p>
          <h2 className="font-heading mt-6 mb-3 text-xl">🕒 Hours</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-[14px] text-neutral-700 sm:grid-cols-1">
            {site.businessHours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4 sm:max-w-xs">
                <span>{h.day}</span>
                <span className="font-medium">
                  {h.closed ? "Closed" : `${h.open} – ${h.close}`}
                </span>
              </li>
            ))}
          </ul>
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
      className="glass flex flex-col items-center gap-2 rounded-3xl p-6 transition-transform hover:-translate-y-1"
    >
      <span className="text-3xl">{icon}</span>
      <strong className="font-heading">{title}</strong>
      <span className="text-sm break-all text-neutral-600">{value}</span>
    </a>
  );
}

function SupportButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="glass-strong hover:text-brand-red inline-flex items-center rounded-full px-4 py-2.5 text-[13px] font-semibold text-neutral-700 transition-all hover:-translate-y-0.5"
    >
      {label}
    </a>
  );
}
