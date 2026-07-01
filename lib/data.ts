import "server-only";
import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { MenuData, MessagesData, OrderLog, SiteData } from "./types";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(filename: string): Promise<T> {
  const raw = await fs.readFile(path.join(dataDir, filename), "utf-8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Failed to parse ${filename} — the file may be corrupt`);
  }
}

// Resolve the canonical site URL from env vars, falling back to site.json.
// Priority: SITE_URL (explicit) → VERCEL_URL (auto-set by Vercel) → site.json value
function resolveSiteUrl(jsonUrl: string): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return jsonUrl;
}

const DEFAULT_MESSAGES: MessagesData = {
  orderPrefix: "🙏 Hi {{brandName}}! I'd like to place an order:\n\n",
  orderSuffix:
    "\n\n📍 Please share delivery details & payment options. Thank you! 🙏\n\n_(Ordered via {{siteUrl}})_",
  generalInquiry:
    "Hi {{brandName}}! 👋 I'd like to know more about your menu and how to order.\n\n_(via {{siteUrl}})_",
  supportComplaint:
    "Hi {{brandName}}, I have an issue with my order:\n\n[Please describe your issue here]\n\n_(via {{siteUrl}})_",
  supportTrack:
    "Hi {{brandName}}! 📦 Could you please share the status of my order?\n\n_(via {{siteUrl}})_",
  supportFeedback:
    "Hi {{brandName}}! ⭐ I'd like to share some feedback:\n\n[Your feedback here]\n\n_(via {{siteUrl}})_",
};

// React.cache memoises per request so duplicate calls in the same render
// (e.g. generateMetadata + page component) only hit the filesystem once.
export const getMenuData = cache(async (): Promise<MenuData> => readJson("menu.json"));

export const getMessages = cache(async (): Promise<MessagesData> =>
  readJson<MessagesData>("messages.json").catch(() => DEFAULT_MESSAGES),
);

export const getSiteData = cache(async (): Promise<SiteData> => {
  const [raw, messages] = await Promise.all([readJson<SiteData>("site.json"), getMessages()]);

  const siteUrl = resolveSiteUrl(raw.siteUrl);

  return {
    ...raw,
    siteUrl,
    orderSource: siteUrl,
    messages,
  };
});

export const getOrders = cache(async (): Promise<OrderLog> => {
  try {
    return await readJson<OrderLog>("orders.json");
  } catch {
    return { orders: [] };
  }
});

export async function appendOrder(order: OrderLog["orders"][number]): Promise<void> {
  const filePath = path.join(dataDir, "orders.json");
  const tmpPath = filePath + ".tmp";
  let log: OrderLog;
  try {
    log = await readJson<OrderLog>("orders.json");
  } catch {
    log = { orders: [] };
  }
  log.orders.push(order);
  await fs.writeFile(tmpPath, JSON.stringify(log, null, 2) + "\n", "utf-8");
  await fs.rename(tmpPath, filePath);
}
