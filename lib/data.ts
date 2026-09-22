import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "./supabase";
import { readPublicMenu } from "./menu-store";
import { DEFAULT_SEO } from "./types";
import type { MenuData, MessagesData, OrderLog, SeoData, SiteData } from "./types";

// Menu lives in normalized tables (see lib/menu-store.ts); site + messages
// live in Supabase site_content (one jsonb row per key). Reads are cached
// with unstable_cache under a tag per key; admin writes call
// revalidateTag(tag, { expire: 0 }) after every save so edits go live
// immediately, while normal traffic is served from cache.
export type ContentKey = "site" | "messages" | "seo";

async function readContent<T>(key: ContentKey): Promise<T> {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("data")
    .eq("key", key)
    .single();
  if (error) throw new Error(`Failed to load "${key}" content: ${error.message}`);
  return data.data as T;
}

export async function saveContent(key: ContentKey, data: unknown): Promise<void> {
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ key, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Failed to save "${key}" content: ${error.message}`);
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

const menuCached = unstable_cache(() => readPublicMenu(), ["content-menu-v2"], {
  tags: ["menu"],
  revalidate: 300,
});

const messagesCached = unstable_cache(
  () => readContent<MessagesData>("messages").catch(() => DEFAULT_MESSAGES),
  ["content-messages"],
  { tags: ["messages"], revalidate: 300 },
);

const siteCached = unstable_cache(() => readContent<SiteData>("site"), ["content-site"], {
  tags: ["site"],
  revalidate: 300,
});

const seoCached = unstable_cache(
  () => readContent<SeoData>("seo").catch(() => DEFAULT_SEO),
  ["content-seo"],
  { tags: ["seo"], revalidate: 300 },
);

export const getSeoData = cache(async (): Promise<SeoData> => {
  const stored = await seoCached();
  const storedKeywords = (stored.keywords ?? []).map((k) => k.trim()).filter(Boolean);
  return {
    metaTitle: stored.metaTitle?.trim() || DEFAULT_SEO.metaTitle,
    metaDescription: stored.metaDescription?.trim() || DEFAULT_SEO.metaDescription,
    keywords: storedKeywords.length > 0 ? storedKeywords : DEFAULT_SEO.keywords,
    aiSummary: stored.aiSummary?.trim() || DEFAULT_SEO.aiSummary,
    googleSiteVerification:
      stored.googleSiteVerification?.trim() || DEFAULT_SEO.googleSiteVerification,
  };
});

// React.cache memoises per request so duplicate calls in the same render
// (e.g. generateMetadata + page component) only hit the data cache once.
export const getMenuData = cache(async (): Promise<MenuData> => menuCached());

export const getMessages = cache(async (): Promise<MessagesData> => messagesCached());

export const getSiteData = cache(async (): Promise<SiteData> => {
  const [raw, messages] = await Promise.all([siteCached(), getMessages()]);

  const siteUrl = resolveSiteUrl(raw.siteUrl);

  return {
    ...raw,
    siteUrl,
    orderSource: siteUrl,
    messages,
  };
});

interface OrderRow {
  id: string;
  created_at: string;
  items: OrderLog["orders"][number]["items"];
  total: number;
  source: string;
}

// Orders are admin-only and always fresh — no unstable_cache on purpose.
export const getOrders = cache(async (): Promise<OrderLog> => {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, items, total, source")
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) return { orders: [] };
  return {
    orders: (data as OrderRow[]).map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      items: row.items,
      total: Number(row.total),
      source: row.source,
    })),
  };
});

export async function appendOrder(order: OrderLog["orders"][number]): Promise<void> {
  const { error } = await supabaseAdmin.from("orders").insert({
    id: order.id,
    created_at: order.timestamp,
    items: order.items,
    total: order.total,
    source: order.source,
  });
  if (error) throw new Error(`Failed to log order: ${error.message}`);
}
