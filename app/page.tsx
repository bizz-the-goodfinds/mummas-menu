import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import About from "@/components/About";
import { getMenuData, getSiteData } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `${site.brandName} — Order Homestyle Food Online on WhatsApp`,
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
      <About site={site} />
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[15px] bg-brand-red text-white shadow-[0_10px_24px_rgba(211,47,47,0.35)] hover:-translate-y-0.5 transition-transform"
          >
            See Full Menu
          </Link>
        </div>
      </section>
      <FaqSection faq={site.faq} />
    </>
  );
}

function FaqSection({ faq }: { faq: { question: string; answer: string }[] }) {
  return (
    <section id="faq" className="py-14">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-heading font-bold text-[26px] md:text-[30px] text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {faq.map((f, i) => (
            <details key={i} className="glass rounded-2xl p-5 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-3">
                {f.question}
                <span className="text-brand-red group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-neutral-700 text-sm mt-3 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
