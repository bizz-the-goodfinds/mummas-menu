import type { Metadata } from "next";
import MenuSection from "@/components/MenuSection";
import { getMenuData, getSiteData } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `Full Menu — ${site.brandName}`,
    description: `Browse the full ${site.brandName} menu: parathas, theplas, sabji, khichdi, farali specials, Maggie and more. Add to cart and order on WhatsApp in seconds.`,
    alternates: { canonical: "/menu" },
  };
}

export default async function MenuPage() {
  const [, menu] = await Promise.all([getSiteData(), getMenuData()]);
  return <MenuSection menu={menu} />;
}
