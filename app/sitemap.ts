import type { MetadataRoute } from "next";
import { getSiteData, getMenuData } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteData();
  const menu = await getMenuData();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.siteUrl}/menu`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = menu.categories.map((cat) => ({
    url: `${site.siteUrl}/menu/${cat.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
