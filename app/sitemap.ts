import type { MetadataRoute } from "next";
import { getSiteData, getMenuData } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteData();
  const menu = await getMenuData();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.siteUrl}/menu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = menu.categories.map((cat) => ({
    url: `${site.siteUrl}/menu/${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
