import { NextRequest, NextResponse } from "next/server";
import { readAdminMenu } from "@/lib/menu-store";
import { requireAdmin } from "../_lib";

// Full admin view of the menu: includes hidden and soft-deleted categories
// and items, with timestamps — powers the admin tables and forms.
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const menu = await readAdminMenu();
  return NextResponse.json(menu);
}
