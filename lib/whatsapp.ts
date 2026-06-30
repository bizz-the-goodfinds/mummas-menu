import type { CartLine, SiteData } from "./types";

export function whatsappLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralMessage(site: SiteData): string {
  return (
    site.messages?.generalInquiry ??
    `Hi ${site.brandName}! 👋 I'd like to know more.\n(via ${site.siteUrl})`
  );
}

export function buildSupportMessage(
  site: SiteData,
  type: "complaint" | "track" | "feedback",
): string {
  const templates = site.messages ?? {};
  const map = {
    complaint: templates.supportComplaint,
    track: templates.supportTrack,
    feedback: templates.supportFeedback,
  };
  return map[type] ?? `Hi ${site.brandName}! I need support.\n\n_(via ${site.siteUrl})_`;
}

export function buildOrderMessage(
  site: SiteData,
  lines: CartLine[],
  instructions?: string,
): string {
  if (lines.length === 0) {
    return buildGeneralMessage(site);
  }

  const prefix = site.messages?.orderPrefix ?? `Hi ${site.brandName}! 👋 I'd like to order:\n\n`;
  const suffix =
    site.messages?.orderSuffix ??
    `\n\nPlease confirm my order. Thank you!\n_(Ordered via ${site.orderSource ?? site.siteUrl})_`;

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
