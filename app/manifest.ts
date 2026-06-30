import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteData();
  return {
    name: `${site.brandName} — Homestyle Cloud Kitchen`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffeded",
    theme_color: "#d32f2f",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
