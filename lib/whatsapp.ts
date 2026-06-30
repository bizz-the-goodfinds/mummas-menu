import type { CartLine } from "./types";

export function whatsappLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralMessage(brandName: string, siteUrl: string): string {
  return `Hi ${brandName}! 👋 I'd like to know more about your menu.\n(via ${siteUrl})`;
}

export function buildOrderMessage(brandName: string, lines: CartLine[], siteUrl: string): string {
  if (lines.length === 0) {
    return `Hi ${brandName}! I'd like to place an order.\n(via ${siteUrl})`;
  }
  let msg = `Hi ${brandName}! 👋 I'd like to order:\n\n`;
  let total = 0;
  for (const line of lines) {
    const lineTotal = line.price * line.qty;
    total += lineTotal;
    msg += `• ${line.name} x${line.qty} — ₹${lineTotal}\n`;
  }
  msg += `\n*Total: ₹${total}*\n\nPlease confirm my order. Thank you!\n(Ordered via ${siteUrl})`;
  return msg;
}
