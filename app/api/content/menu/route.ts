import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getMenuData } from "@/lib/data";
import type { MenuData } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "menu.json");

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && token === expected;
}

export async function GET() {
  const menu = await getMenuData();
  return NextResponse.json(menu);
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let data: MenuData;
  try {
    data = (await req.json()) as MenuData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!data || !Array.isArray(data.categories)) {
    return NextResponse.json({ error: "Malformed menu data" }, { status: 400 });
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true });
}
