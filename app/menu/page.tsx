import type { Metadata } from "next";
import { Suspense } from "react";
import MenuSection from "@/components/MenuSection";
import { getMenuData, getSiteData } from "@/lib/data";
import { isOrderable } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  const description = `Browse the full ${site.brandName} menu: parathas, theplas, sabji, khichdi, farali specials, Maggi and more. Add to cart and order on WhatsApp in seconds.`;
  return {
    title: `Full Menu — ${site.brandName}`,
    description,
    alternates: { canonical: "/menu" },
    openGraph: {
      title: `Full Menu — ${site.brandName}`,
      description,
      url: `${site.siteUrl}/menu`,
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Full Menu — ${site.brandName}`,
      description,
      images: [site.ogImage],
    },
  };
}

export default async function MenuPage() {
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);

  // Full schema.org Menu — the strongest structured-data signal a food
  // business can give search and answer engines.
  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${site.brandName} Menu`,
    url: `${site.siteUrl}/menu`,
    inLanguage: "en-IN",
    hasMenuSection: menu.categories
      .filter((c) => c.items.length > 0)
      .map((cat) => ({
        "@type": "MenuSection",
        name: cat.name,
        url: `${site.siteUrl}/menu/${cat.slug}`,
        hasMenuItem: cat.items.map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description,
          image: item.image || undefined,
          suitableForDiet: "https://schema.org/VegetarianDiet",
          offers: {
            "@type": "Offer",
            price: item.price,
            priceCurrency: "INR",
            availability: isOrderable(item.status)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        })),
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />
      <Suspense fallback={<MenuSectionFallback />}>
        <MenuSection menu={menu} />
      </Suspense>
    </>
  );
}

function MenuSectionFallback() {
  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <span className="text-brand-red mb-1 block text-[13px] font-semibold tracking-wider uppercase">
          100% Pure Veg · Cooked Fresh Daily
        </span>
        <h1 className="font-heading text-[28px] md:text-[36px]">Our Menu</h1>
      </div>
    </section>
  );
}
