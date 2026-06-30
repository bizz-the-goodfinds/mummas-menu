import type { SiteData } from "@/lib/types";
import { buildGeneralMessage, whatsappLink } from "@/lib/whatsapp";

export default function Hero({ site }: { site: SiteData }) {
  const generalMsg = buildGeneralMessage(site.brandName, site.siteUrl);

  return (
    <section id="home" className="pt-16 pb-14 md:pt-[70px] md:pb-[60px]">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-12 items-center">
        <div>
          <span className="glass inline-block px-4 py-2 rounded-full text-[13px] font-semibold text-brand-red mb-5">
            {site.tagline}
          </span>
          <h1 className="font-heading font-bold text-[32px] md:text-[46px] leading-[1.15] mb-4">
            Homestyle food, <br />
            made with <span className="text-brand-red">Mumma&apos;s love</span> ❤️
          </h1>
          <p className="text-[16px] leading-[1.7] text-neutral-700 max-w-[480px] mb-7">
            Order parathas, theplas, sabji, khichdi, maggie &amp; more — straight from our cloud
            kitchen to your door. Pick your favourites, add to cart, and order directly on
            WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3.5 mb-9">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-full font-semibold text-[15px] bg-brand-red text-white shadow-[0_10px_24px_rgba(211,47,47,0.35)] hover:-translate-y-0.5 transition-transform"
            >
              View Menu
            </a>
            <a
              href={whatsappLink(site.whatsappNumber, generalMsg)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-full font-semibold text-[15px] text-brand-red glass-strong hover:-translate-y-0.5 transition-transform"
            >
              <WhatsAppIcon />
              Order on WhatsApp
            </a>
          </div>
          <div className="flex gap-9 flex-wrap">
            <Stat value="100%" label="Homemade" />
            <Stat value="9+" label="Categories" />
            <Stat value="★ 4.9" label="Loved by locals" />
          </div>
        </div>

        <div className="relative h-[320px] md:h-[420px] hidden xs:block">
          <HeroCard emoji="🫓" name="Aloo Paratha" price={80} className="top-[10%] left-[10%]" />
          <HeroCard
            emoji="🍛"
            name="Paneer Butter Masala"
            price={110}
            className="top-[38%] left-[42%]"
            delay="1.2s"
          />
          <HeroCard
            emoji="🍜"
            name="Cheese Tadka Maggie"
            price={100}
            className="top-[64%] left-[8%]"
            delay="2.4s"
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <strong className="font-heading text-xl text-brand-red">{value}</strong>
      <span className="text-[13px] text-neutral-600">{label}</span>
    </div>
  );
}

function HeroCard({
  emoji,
  name,
  price,
  className,
  delay,
}: {
  emoji: string;
  name: string;
  price: number;
  className: string;
  delay?: string;
}) {
  return (
    <div
      className={`glass absolute w-[170px] p-[22px] rounded-3xl text-center animate-float ${className}`}
      style={delay ? { animationDelay: delay } : undefined}
    >
      <div className="text-[44px] mb-2.5">{emoji}</div>
      <p className="font-semibold text-sm mb-1.5">{name}</p>
      <span className="text-brand-red font-bold font-heading">₹{price}</span>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5C10.3 9.6 9.9 8.4 9.7 8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3C8.5 21.6 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3C3.9 14.9 3.4 13.5 3.4 12c0-4.7 3.9-8.6 8.6-8.6s8.6 3.9 8.6 8.6-3.9 8.6-8.6 8.6z" />
    </svg>
  );
}
