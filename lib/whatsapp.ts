import type { CartLine, SiteData } from "./types";

/** Replace {{siteUrl}} and {{brandName}} placeholders in a message template. */
function interpolate(template: string, site: SiteData): string {
  return template
    .replace(/\{\{siteUrl\}\}/g, site.siteUrl)
    .replace(/\{\{brandName\}\}/g, site.brandName);
}

export function whatsappLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralMessage(site: SiteData): string {
  const template =
    site.messages?.generalInquiry ??
    `Hi {{brandName}}! 👋 I'd like to know more.\n(via {{siteUrl}})`;
  return interpolate(template, site);
}

export function buildSupportMessage(
  site: SiteData,
  type: "complaint" | "track" | "feedback",
): string {
  const map = {
    complaint: site.messages?.supportComplaint,
    track: site.messages?.supportTrack,
    feedback: site.messages?.supportFeedback,
  };
  const template = map[type] ?? `Hi {{brandName}}! I need support.\n\n_(via {{siteUrl}})_`;
  return interpolate(template, site);
}

export function buildOrderMessage(
  site: SiteData,
  lines: CartLine[],
  instructions?: string,
): string {
  if (lines.length === 0) {
    return buildGeneralMessage(site);
  }

  const prefix = interpolate(
    site.messages?.orderPrefix ?? `Hi {{brandName}}! 👋 I'd like to order:\n\n`,
    site,
  );
  const suffix = interpolate(
    site.messages?.orderSuffix ??
      `\n\nPlease confirm my order. Thank you!\n_(Ordered via {{siteUrl}})_`,
    site,
  );

  let total = 0;
  let items = "";
  lines.forEach((line, i) => {
    const lineTotal = line.price * line.qty;
    total += lineTotal;
    items += `${i + 1}. ${line.name} × ${line.qty} = ₹${lineTotal}\n`;
  });

  const instructionsBlock = instructions?.trim()
    ? `\n📝 *Special instructions:* ${instructions.trim()}\n`
    : "";

  return `${prefix}${items}${instructionsBlock}\n*Total: ₹${total}*${suffix}`;
}
