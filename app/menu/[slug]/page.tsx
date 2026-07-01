import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMenuData, getSiteData } from "@/lib/data";
import { ItemCard } from "@/components/ui/ItemCard";

export async function generateStaticParams() {
  const menu = await getMenuData();
  return menu.categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);
  const category = menu.categories.find((c) => c.slug === slug);
  if (!category) return {};
  const itemNames = category.items.map((i) => i.name).join(", ");
  const description = `Order fresh ${category.name} from ${site.brandName}: ${itemNames}. FSSAI-approved home-style cooking, checkout instantly on WhatsApp.`;
  const ogImage = category.items[0]?.image || site.ogImage;
  return {
    title: `${category.name} — ${site.brandName} Menu`,
    description,
    alternates: { canonical: `/menu/${slug}` },
    openGraph: {
      title: `${category.name} — ${site.brandName}`,
      description,
      url: `${site.siteUrl}/menu/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: category.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} — ${site.brandName}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);
  const category = menu.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} — ${site.brandName}`,
    itemListElement: category.items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
        image: item.image || undefined,
        offers: {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        suitableForDiet: "https://schema.org/VegetarianDiet",
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.siteUrl },
      { "@type": "ListItem", position: 2, name: "Menu", item: `${site.siteUrl}/menu` },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${site.siteUrl}/menu/${slug}`,
      },
    ],
  };

  return (
    <section className="py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-6">
        <nav
          className="mb-5 flex items-center gap-1.5 text-[13px] text-neutral-500"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-brand-red">
            Home
          </Link>
          <span>/</span>
          <Link href="/menu" className="hover:text-brand-red">
            Menu
          </Link>
          <span>/</span>
          <span className="font-medium text-neutral-800">{category.name}</span>
        </nav>

        <h1 className="font-heading mb-2 flex items-center gap-2 text-[28px] font-bold md:text-[36px]">
          <span aria-hidden>{category.emoji}</span>
          {category.name}
        </h1>
        <p className="mb-8 text-[15px] text-neutral-600">
          {category.items.length} item{category.items.length !== 1 ? "s" : ""} freshly made by{" "}
          {site.brandName} — FSSAI approved, no artificial colours.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item) => (
            <div key={item.id} itemScope itemType="https://schema.org/MenuItem">
              <meta itemProp="name" content={item.name} />
              <meta itemProp="description" content={item.description} />
              <ItemCard item={item} categoryEmoji={category.emoji} variant="grid" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/menu" className="text-brand-red text-[14px] font-semibold hover:underline">
            ← Back to full menu
          </Link>
          <Link href="/" className="hover:text-brand-red text-[14px] font-medium text-neutral-500">
            View homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
