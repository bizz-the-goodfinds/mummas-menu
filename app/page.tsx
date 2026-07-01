import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import About from "@/components/About";
import { getMenuData, getSiteData } from "@/lib/data";
import type { MenuItem, MenuData, Testimonial } from "@/lib/types";
import { FeaturedGrid } from "@/components/FeaturedGrid";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `${site.brandName} — 100% Pure Veg Homestyle Cloud Kitchen, Vadodara`,
    description: site.description,
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero site={site} />
      <FeaturedSection menu={menu} />
      <About site={site} />
      {site.testimonials && site.testimonials.length > 0 && (
        <TestimonialsSection testimonials={site.testimonials} />
      )}
      <FaqSection faq={site.faq} />
    </>
  );
}

const FEATURED_COUNT = 6;
const FEATURED_UNTAGGED_COUNT = 2;

function FeaturedSection({ menu }: { menu: MenuData }) {
  type FeaturedItem = MenuItem & { categoryEmoji: string };

  const tagged: FeaturedItem[] = [];
  const untagged: FeaturedItem[] = [];

  for (const cat of menu.categories) {
    for (const item of cat.items) {
      const hasTag = item.tags?.some((t) => t.trim().length > 0);
      const bucket = hasTag ? tagged : untagged;
      bucket.push({ ...item, categoryEmoji: cat.emoji });
    }
  }

  // Surface every distinct tag at least once before topping up with more of the same tag,
  // so e.g. a single "mummas-sp" item isn't crowded out by 10 "bestseller" items.
  const seenTags = new Set<string>();
  const taggedByVariety: FeaturedItem[] = [];
  for (const item of tagged) {
    if (item.tags!.some((t) => t.trim() && !seenTags.has(t))) {
      item.tags!.forEach((t) => t.trim() && seenTags.add(t));
      taggedByVariety.push(item);
    }
  }
  for (const item of tagged) {
    if (!taggedByVariety.includes(item)) taggedByVariety.push(item);
  }

  const untaggedSlots = Math.min(FEATURED_UNTAGGED_COUNT, untagged.length);
  const taggedSlots = FEATURED_COUNT - untaggedSlots;
  const taggedPicks = taggedByVariety.slice(0, taggedSlots);

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="text-brand-red mb-1 block text-[13px] font-semibold tracking-wider uppercase">
              TOP PICKS
            </span>
            <h2 className="font-heading text-[26px] md:text-[30px]">Worth Trying</h2>
          </div>
          <Link href="/menu" className="text-brand-red text-[14px] font-semibold hover:underline">
            Full Menu →
          </Link>
        </div>

        <FeaturedGrid
          taggedItems={taggedPicks}
          untaggedPool={untagged}
          untaggedCount={untaggedSlots}
        />

        <div className="mt-8 text-center">
          <Link
            href="/menu"
            className="bg-brand-red inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(211,47,47,0.35)] transition-transform hover:-translate-y-0.5"
          >
            See Full Menu →
          </Link>
        </div>
      </div>
    </section>
  );
}

const AVATAR_EMOJIS = ["😋", "🤩", "🙌", "😍", "🥰", "👍", "🎉", "😊"];

function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <span className="text-brand-red mb-2 inline-block text-[13px] font-semibold tracking-wider uppercase">
            Customer Love
          </span>
          <h2 className="font-heading text-[26px] md:text-[30px]">What Vadodara is saying ❤️</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="glass flex flex-col gap-4 rounded-[22px] p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <svg
                    key={s}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#f59e0b"
                    aria-hidden
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="flex-1 text-[14px] leading-[1.7] text-neutral-700">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="bg-brand-red/10 flex h-10 w-10 items-center justify-center rounded-full text-[20px] ring-2 ring-white">
                  {t.avatarEmoji ?? AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}
                </div>
                <div>
                  <p className="text-[14px] font-semibold">{t.name}</p>
                  <p className="text-[12px] text-neutral-500">📍 {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faq }: { faq: { question: string; answer: string }[] }) {
  return (
    <section id="faq" className="py-14">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-heading mb-8 text-center text-[26px] md:text-[30px]">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {faq.map((f, i) => (
            <details key={i} className="glass group rounded-2xl p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {f.question}
                <span className="text-brand-red text-xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
