import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/data";

// AI/answer-engine crawlers we explicitly welcome (GEO): being listed by
// name documents intent and survives any future default-deny rule.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteData();
  return {
    // The admin panel path is intentionally NOT listed here — a robots.txt
    // disallow entry would advertise the unlisted URL. Its layout sets
    // noindex metadata and next.config adds an X-Robots-Tag header instead.
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api"] },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/api"] })),
    ],
    sitemap: `${site.siteUrl}/sitemap.xml`,
  };
}
