import type { SiteData } from "@/lib/types";

export default function About({ site, compact = false }: { site: SiteData; compact?: boolean }) {
  return (
    <section id="about" className={compact ? "py-14" : "py-16 md:py-[70px]"}>
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-12 items-center">
        <div className="glass h-[220px] md:h-[300px] rounded-[28px] flex items-center justify-center">
          <span className="text-[90px] md:text-[120px]" aria-hidden>
            👩‍🍳
          </span>
        </div>
        <div>
          <span className="glass inline-block px-4 py-2 rounded-full text-[13px] font-semibold text-brand-red mb-3.5">
            About Us
          </span>
          <h2 className="font-heading text-[26px] md:text-[32px] mb-4">{site.about.heading}</h2>
          {site.about.paragraphs.map((p, i) => (
            <p key={i} className="text-neutral-700 leading-[1.7] mb-4">
              {p}
            </p>
          ))}
          <ul className="flex flex-col gap-3 mt-2">
            {site.about.highlights.map((h, i) => (
              <li key={i} className="font-medium text-[15px]">
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
