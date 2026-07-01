import type { Metadata } from "next";
import MenuSection from "@/components/MenuSection";
import { getMenuData, getSiteData } from "@/lib/data";

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
  const [, menu] = await Promise.all([getSiteData(), getMenuData()]);
  return <MenuSection menu={menu} />;
}
