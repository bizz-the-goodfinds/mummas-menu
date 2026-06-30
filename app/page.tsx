import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import About from "@/components/About";
import { getMenuData, getSiteData } from "@/lib/data";
import type { Testimonial } from "@/lib/types";

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

  return (
    <>
      <Hero site={site} />
      <MenuSection menu={menu} />
      <About site={site} compact />
      {site.testimonials && site.testimonials.length > 0 && (
        <TestimonialsSection testimonials={site.testimonials} />
      )}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Link
            href="/menu"
            className="bg-brand-red inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(211,47,47,0.35)] transition-transform hover:-translate-y-0.5"
          >
            See Full Menu →
          </Link>
        </div>
      </section>
      <FaqSection faq={site.faq} />
    </>
  );
}

function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <span className="text-brand-red mb-2 inline-block text-[13px] font-semibold tracking-wider uppercase">
            Customer Love
          </span>
          <h2 className="font-heading text-[24px] font-bold md:text-[28px]">
            What Vadodara is saying ❤️
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="glass flex flex-col gap-4 rounded-[22px] p-6">
              {/* Stars */}
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

              {/* Author */}
              <div className="flex items-center gap-3">
                {t.avatar ? (
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="bg-brand-red flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                )}
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
        <h2 className="font-heading mb-8 text-center text-[24px] font-bold md:text-[28px]">
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
