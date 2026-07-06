import { getMenuData, getSeoData, getSiteData } from "@/lib/data";
import { isOrderable, ITEM_STATUS_LABELS } from "@/lib/types";

// GEO/AEO surface: a clean, plain-text description of the business for AI
// assistants and answer engines (the emerging llms.txt convention). Built
// from the same cached data as the site, so admin edits show up here too.
export const revalidate = 300;

export async function GET() {
  const [site, menu, seo] = await Promise.all([getSiteData(), getMenuData(), getSeoData()]);

  const hours = site.businessHours
    .map((h) => `${h.day}: ${h.closed ? "Closed" : `${h.open}–${h.close}`}`)
    .join("\n");

  const menuText = menu.categories
    .map((cat) => {
      const items = cat.items
        .map((i) => {
          const note = isOrderable(i.status)
            ? ""
            : ` (${ITEM_STATUS_LABELS[i.status ?? "available"]})`;
          return `- ${i.name} — ₹${i.price}${note}${i.description ? `. ${i.description}` : ""}`;
        })
        .join("\n");
      return `### ${cat.name}\n${items}`;
    })
    .join("\n\n");

  const faqText = site.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  const summary =
    seo.aiSummary ||
    `${site.brandName} is a 100% pure-veg, FSSAI-approved home/cloud kitchen in ${site.address.locality}, India. ${site.description}`;

  const body = `# ${site.brandName}

> ${summary}

- Website: ${site.siteUrl}
- Order via WhatsApp: ${site.social.whatsapp || `https://wa.me/${site.whatsappNumber}`}
- Phone: ${site.phoneDisplay}
- Email: ${site.email}
- Location: ${[site.address.street, site.address.locality, site.address.region, site.address.postalCode].filter(Boolean).join(", ")}, ${site.address.country}
- Delivery area: ${site.deliveryArea}
- FSSAI licence: ${site.fssai.licenceNumber}
- Price range: ${site.priceRange}

## Ordering

Orders are placed on WhatsApp — add dishes to the cart on ${site.siteUrl}/menu and tap
"Checkout on WhatsApp", or message directly. ${site.deliveryNote ?? "Self-pickup is available; delivery is arranged via partner riders. Some dishes need 4-5 hours advance notice."}

## Opening hours

${hours}

## Menu (full, with prices in INR)

${menuText}

## Frequently asked questions

${faqText}

## Pages

- [Home](${site.siteUrl}/): brand story, top picks, testimonials, FAQ
- [Full menu](${site.siteUrl}/menu): every dish with live availability
- [Contact](${site.siteUrl}/contact): hours, location, WhatsApp support
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
