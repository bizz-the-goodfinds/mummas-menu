import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteData();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: `${site.siteUrl}/sitemap.xml`,
  };
}
