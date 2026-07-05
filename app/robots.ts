import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteData();
  return {
    // The admin portal path is intentionally NOT listed here — a robots.txt
    // disallow entry would advertise the unlisted URL. Its layout sets
    // noindex metadata instead.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api"] }],
    sitemap: `${site.siteUrl}/sitemap.xml`,
  };
}
