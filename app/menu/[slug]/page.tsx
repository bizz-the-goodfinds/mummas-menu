import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMenuData, getSiteData } from "@/lib/data";
import CategoryItemList from "@/components/CategoryItemList";

export async function generateStaticParams() {
  const menu = await getMenuData();
  return menu.categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);
  const category = menu.categories.find((c) => c.slug === slug);
  if (!category) return {};
  const itemNames = category.items.map((i) => i.name).join(", ");
  return {
    title: `${category.name} — ${site.brandName} Menu`,
    description: `Order ${category.name} from ${site.brandName}: ${itemNames}. Freshly cooked and delivered, checkout instantly on WhatsApp.`,
    alternates: { canonical: `/menu/${slug}` },
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
        offers: { "@type": "Offer", price: item.price, priceCurrency: "INR" },
      },
    })),
  };

  return (
    <section className="py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-6">
        <nav className="text-sm text-neutral-500 mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-red">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/menu" className="hover:text-brand-red">
            Menu
          </Link>{" "}
          / <span className="text-black">{category.name}</span>
        </nav>
        <h1 className="font-heading font-bold text-3xl mb-2">
          {category.emoji} {category.name}
        </h1>
        <p className="text-neutral-600 mb-8">
          {category.items.length} item{category.items.length > 1 ? "s" : ""} freshly made by {site.brandName}.
        </p>

        <CategoryItemList emoji={category.emoji} items={category.items} />

        <div className="mt-10">
          <Link href="/menu" className="text-brand-red font-semibold hover:underline">
            ← Back to full menu
          </Link>
        </div>
      </div>
    </section>
  );
}
