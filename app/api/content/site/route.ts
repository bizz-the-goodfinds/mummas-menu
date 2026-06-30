import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSiteData } from "@/lib/data";
import { isAuthorized } from "@/lib/auth";
import type { SiteData } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "site.json");
const MAX_BODY_BYTES = 128_000;

const ALLOWED_KEYS: Array<keyof SiteData> = [
  "brandName",
  "shortName",
  "tagline",
  "description",
  "siteUrl",
  "logo",
  "ogImage",
  "whatsappNumber",
  "phoneDisplay",
  "email",
  "address",
  "hours",
  "priceRange",
  "social",
  "about",
  "faq",
  "fssai",
  "deliveryArea",
  "businessHours",
  "orderSource",
  "messages",
  "support",
  "retention",
  "testimonials",
  "deliveryNote",
];

export async function GET() {
  const site = await getSiteData();
  return NextResponse.json(site);
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
  if (!data || typeof data.brandName !== "string" || !data.brandName.trim()) {
    return NextResponse.json({ error: "brandName is required" }, { status: 400 });
  }

  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_KEYS) {
    if (key in data) sanitized[key] = data[key];
  }

  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true });
}
