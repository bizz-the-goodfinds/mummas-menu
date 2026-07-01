import type { SiteData } from "@/lib/types";

const HIGHLIGHT_ICONS = ["🌿", "✅", "🚫", "💬", "👩‍🍳", "🍛"];

export default function About({ site }: { site: SiteData }) {
  return (
    <section id="about" className="scroll-mt-24 py-16 md:py-[70px]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
        <div className="glass flex h-[220px] items-center justify-center rounded-[28px] md:h-[320px]">
          <span className="text-[90px] md:text-[120px]" aria-hidden>
            👩‍🍳
          </span>
        </div>
        <div>
          <span className="text-brand-red mb-2 inline-block text-[13px] font-semibold tracking-wider uppercase">
            Our Story
          </span>
          <h2 className="font-heading mb-4 text-[26px] md:text-[32px]">{site.about.heading}</h2>
          {site.about.story && (
            <p className="mb-4 leading-[1.7] text-neutral-700">{site.about.story}</p>
          )}
          {site.about.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 leading-[1.7] text-neutral-700">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Highlights grid */}
      {site.about.highlights.length > 0 && (
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
        </div>
      )}
    </section>
  );
}
