import { NextResponse } from "next/server";
import { getMenuData } from "@/lib/data";

// Public, read-only: the customer-facing menu (visible items only).
// All menu writes go through the granular admin APIs under /api/admin/*.
export async function GET() {
  const menu = await getMenuData();
  return NextResponse.json(menu);
}
