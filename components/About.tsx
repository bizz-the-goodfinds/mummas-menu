import Image from "next/image";
import Link from "next/link";
import type { SiteData } from "@/lib/types";
import { FssaiBadge } from "@/components/ui/Badge";

const HIGHLIGHT_ICONS = ["🌿", "✅", "🚫", "💬", "👩‍🍳", "🍛"];

export default function About({ site, compact = false }: { site: SiteData; compact?: boolean }) {
  if (compact) {
    return <AboutStrip site={site} />;
  }

  return (
    <section id="about" className="py-16 md:py-[70px]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
        <div className="glass flex h-[220px] items-center justify-center rounded-[28px] md:h-[320px]">
          <span className="text-[90px] md:text-[120px]" aria-hidden>
            👩‍🍳
          </span>
        </div>
        <div>
          <span className="glass text-brand-red mb-3.5 inline-block rounded-full px-4 py-2 text-[13px] font-semibold">
            Our Story
          </span>
          <h2 className="font-heading mb-4 text-[26px] md:text-[32px]">{site.about.heading}</h2>
          {site.about.story && (
            <p className="mb-4 leading-[1.7] text-neutral-700 italic">{site.about.story}</p>
          )}
          {site.about.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 leading-[1.7] text-neutral-700">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Highlights grid */}
      <div className="mx-auto mt-12 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {site.about.highlights.map((h, i) => (
            <div
              key={i}
              className="glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center"
            >
              <span className="text-[28px]" aria-hidden>
                {HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]}
              </span>
              <p className="text-[12px] leading-snug font-medium text-neutral-700">{h}</p>
            </div>
          ))}
        </div>

        {/* FSSAI trust strip */}
        <div className="glass-strong mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl p-7 sm:flex-row">
          <div className="flex items-center gap-4">
            {site.fssai.certImage ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-green-200">
                <Image
                  src={site.fssai.certImage}
                  alt="FSSAI certificate"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <FssaiBadge />
            )}
            <div>
              <p className="font-heading text-[16px] font-bold">Licensed &amp; Certified Kitchen</p>
              <p className="text-[13px] text-neutral-600">
                FSSAI Licence No. {site.fssai.licenceNumber} — 100% pure veg, always
              </p>
            </div>
          </div>
          <Link
            href="/trust"
            className="text-brand-red shrink-0 text-[14px] font-semibold hover:underline"
          >
            View Certification →
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutStrip({ site }: { site: SiteData }) {
  return (
    <section id="about" className="py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass rounded-[28px] p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
            {/* Emoji visual */}
            <div className="bg-brand-pink hidden h-24 w-24 items-center justify-center rounded-2xl text-[52px] md:flex">
              👩‍🍳
            </div>

            <div>
              <span className="text-brand-red mb-2 inline-block text-[13px] font-semibold tracking-wider uppercase">
                About Us
              </span>
              <h2 className="font-heading mb-3 text-[22px] font-bold md:text-[26px]">
                {site.about.heading}
              </h2>
              <p className="mb-5 max-w-[600px] text-[14px] leading-[1.7] text-neutral-600">
                {site.about.story ?? site.about.paragraphs[0]}
              </p>

              {/* Highlight chips */}
              <div className="mb-5 flex flex-wrap gap-2">
                {site.about.highlights.slice(0, 4).map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 ring-1 ring-white/80"
                  >
                    <span aria-hidden>{HIGHLIGHT_ICONS[i]}</span>
                    {h}
                  </span>
                ))}
              </div>

              <Link
                href="/about"
                className="text-brand-red text-[14px] font-semibold hover:underline"
              >
                Read our full story →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
