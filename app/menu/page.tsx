import type { Metadata } from "next";
import Link from "next/link";
import MenuSection from "@/components/MenuSection";
import { getMenuData, getSiteData } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `Full Menu — ${site.brandName}`,
    description: `Browse the full ${site.brandName} menu: parathas, theplas, sabji, khichdi, farali specials, Maggie and more. Add to cart and order on WhatsApp.`,
    alternates: { canonical: "/menu" },
  };
}

export default async function MenuPage() {
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);

  return (
    <>
      <div className="pt-10 pb-2 text-center px-6">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">Our Menu</h1>
        <p className="text-neutral-600 max-w-xl mx-auto">{site.tagline}</p>
        <div className="flex flex-wrap justify-center gap-2.5 mt-5">
          {menu.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/menu/${cat.slug}`}
              className="glass px-4 py-2 rounded-full text-sm font-semibold hover:-translate-y-0.5 transition-transform"
            >
              {cat.emoji} {cat.name}
            </Link>
          ))}
        </div>
      </div>
      <MenuSection menu={menu} />
    </>
  );
}
