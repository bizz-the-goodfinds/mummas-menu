import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getMenuData } from "@/lib/data";
import { isAuthorized } from "@/lib/auth";
import type { MenuData, MenuCategory, MenuItem } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "menu.json");
const MAX_BODY_BYTES = 256_000;

function sanitizeItem(item: unknown): MenuItem {
  const i = item as Record<string, unknown>;
  return {
    id: String(i.id ?? "").slice(0, 128),
    name: String(i.name ?? "").slice(0, 128),
    price: Math.max(0, Math.min(Number(i.price) || 0, 100_000)),
    veg: Boolean(i.veg),
    description: String(i.description ?? "").slice(0, 512),
    image: String(i.image ?? "").slice(0, 512),
    tags: Array.isArray(i.tags) ? (i.tags as unknown[]).map(String).slice(0, 8) : [],
  };
}

function sanitizeCategory(cat: unknown): MenuCategory {
  const c = cat as Record<string, unknown>;
  return {
    slug: String(c.slug ?? "").slice(0, 64),
    name: String(c.name ?? "").slice(0, 64),
    emoji: String(c.emoji ?? "").slice(0, 8),
    items: Array.isArray(c.items) ? c.items.map(sanitizeItem) : [],
  };
}

export async function GET() {
  const menu = await getMenuData();
  return NextResponse.json(menu);
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = raw as Record<string, unknown>;
  if (!data || !Array.isArray(data.categories)) {
    return NextResponse.json({ error: "Malformed menu data" }, { status: 400 });
  }

  const sanitized: MenuData = {
    categories: (data.categories as unknown[]).map(sanitizeCategory),
  };

  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true });
}
