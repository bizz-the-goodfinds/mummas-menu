import Image from "next/image";
import type { SiteData } from "@/lib/types";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { LinkButton } from "@/components/ui/Button";

const TRUST_BADGES = [
  { icon: "🌿", label: "100% Pure Veg" },
  { icon: "✅", label: "FSSAI Approved" },
  { icon: "📍", label: "Vadodara" },
];

export default function Hero({ site }: { site: SiteData }) {
  const generalMsg = buildGeneralMessage(site);
  const waHref = whatsappLink(site.whatsappNumber, generalMsg);

  return (
    <section id="home" className="relative overflow-hidden pt-6 pb-10 md:pt-10 md:pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          {/* ── Left: Copy ── */}
          <div>
            {/* Trust chips */}
            <div className="no-scrollbar mb-5 overflow-x-auto">
              <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
                {TRUST_BADGES.map((b) => (
                  <span
                    key={b.label}
                    className="glass inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-neutral-700"
                  >
                    <span>{b.icon}</span>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="font-heading mb-5 text-[34px] leading-[1.2] md:text-[54px]">
              Homestyle food, <span className="text-brand-red">made with love</span>
              <br />
            </h1>

            <p className="mb-7 max-w-[480px] text-[15px] leading-[1.75] text-neutral-600 md:text-[16px]">
              Parathas, theplas, sabji, khichdi, farali specials &amp; comforting Maggi — all cooked
              fresh daily, the way Mumma makes it. Order on WhatsApp in under a minute.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              <LinkButton href="/menu" variant="primary" size="lg">
                Browse Menu
              </LinkButton>
              <LinkButton
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
              >
                <WhatsAppIcon />
                Order on WhatsApp
              </LinkButton>
            </div>
          </div>

          {/* ── Right: Food image ── */}
          <div className="relative hidden h-[460px] md:block">
            {/* Main image */}
            <div className="glass absolute inset-0 overflow-hidden rounded-[32px]">
              <Image
                src="/images/meal/sabji-roti-daal-rice.png"
                alt="Homestyle tiffin meal from Mumma's Menu, Vadodara — sabji, roti, dal, rice"
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute right-4 bottom-4 left-4">
                <p className="text-[13px] font-semibold text-white/90 drop-shadow">
                  🍱 Homestyle tiffin — just like Mumma makes it
                </p>
              </div>
            </div>

            {/* Floating cards */}
            <FloatingCard
              image="/images/meal/aloo-paratha.png"
              name="Aloo Paratha"
              price={60}
              badge="Bestseller"
              className="-top-4 -left-4 md:-left-8"
            />
            <FloatingCard
              image="/images/meal/cheese-tadka-maggi.png"
              name="Cheese Tadka Maggi"
              price={80}
              badge="Most loved"
              className="-right-4 -bottom-4 md:-right-8"
              delay="1.8s"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  image,
  name,
  price,
  badge,
  className,
  delay,
}: {
  image: string;
  name: string;
  price: number;
  badge: string;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`glass-strong animate-float absolute z-10 w-[158px] overflow-hidden rounded-2xl ${className ?? ""}`}
      style={delay ? { animationDelay: delay } : undefined}
    >
      <div className="bg-brand-pink relative h-[80px] w-full">
        <Image src={image} alt={name} fill sizes="158px" className="object-cover" />
      </div>
      <div className="p-3">
        <p className="mb-0.5 text-[10px] font-bold text-green-700">{badge}</p>
        <p className="text-[12px] leading-snug font-semibold">{name}</p>
        <span className="font-heading text-brand-red text-[14px] font-bold">₹{price}</span>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5C10.3 9.6 9.9 8.4 9.7 8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3C3.9 14.9 3.4 13.5 3.4 12c0-4.7 3.9-8.6 8.6-8.6s8.6 3.9 8.6 8.6-3.9 8.6-8.6 8.6z" />
    </svg>
  );
}
