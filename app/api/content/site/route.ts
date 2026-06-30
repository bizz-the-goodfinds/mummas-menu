import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSiteData } from "@/lib/data";
import type { SiteData } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "site.json");

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && token === expected;
}

export async function GET() {
  const site = await getSiteData();
  return NextResponse.json(site);
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let data: SiteData;
  try {
    data = (await req.json()) as SiteData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!data || !data.brandName) {
    return NextResponse.json({ error: "Malformed site data" }, { status: 400 });
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true });
}
