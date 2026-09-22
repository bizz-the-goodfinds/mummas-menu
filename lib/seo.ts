import type { BusinessHour, SiteData } from "@/lib/types";

/** Convert admin display times ("08:00 AM") to schema.org 24-hour "08:00". */
export function toSchemaTime(display: string): string | undefined {
  const match = display.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let hour = Number.parseInt(match[1], 10);
  const minute = match[2];
  const meridian = match[3]?.toUpperCase();
  if (meridian === "AM" && hour === 12) hour = 0;
  if (meridian === "PM" && hour < 12) hour += 12;
  if (hour < 0 || hour > 23) return undefined;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function openingHoursSpecification(hours: BusinessHour[]) {
  return hours.flatMap((h) => {
    if (h.closed) return [];
    const opens = toSchemaTime(h.open);
    const closes = toSchemaTime(h.close);
    if (!opens || !closes) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${h.day}`,
        opens,
        closes,
      },
    ];
  });
}

export function absoluteUrl(siteUrl: string, path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteUrl.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function restaurantJsonLd(site: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
    name: site.brandName,
    description: site.description,
    url: site.siteUrl,
    image: absoluteUrl(site.siteUrl, site.ogImage),
    logo: absoluteUrl(site.siteUrl, site.logo),
    telephone: site.phoneDisplay,
    email: site.email,
    priceRange: site.priceRange,
    servesCuisine: ["Indian", "Gujarati", "Maharashtrian", "Vegetarian"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street || undefined,
      addressLocality: site.address.locality,
      addressRegion: site.address.region || undefined,
      postalCode: site.address.postalCode || undefined,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: openingHoursSpecification(site.businessHours),
    sameAs: [site.social.instagram, site.social.facebook, site.social.whatsapp].filter(Boolean),
    acceptsReservations: false,
    hasMenu: `${site.siteUrl}/menu`,
    areaServed: {
      "@type": "City",
      name: site.address.locality,
      containedInPlace: {
        "@type": "State",
        name: site.address.region,
      },
    },
    ...(site.fssai?.licenceNumber
      ? { identifier: { "@type": "PropertyValue", name: "FSSAI", value: site.fssai.licenceNumber } }
      : {}),
  };
}

export function websiteJsonLd(site: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.brandName,
    url: site.siteUrl,
    inLanguage: "en-IN",
    description: site.description,
  };
}
