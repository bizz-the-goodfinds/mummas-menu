import { NextRequest, NextResponse } from "next/server";
import { createItem } from "@/lib/menu-store";
import {
  adminLog,
  badRequest,
  parseJson,
  requireAdmin,
  revalidateMenu,
  sanitizePrice,
  sanitizeStatus,
  sanitizeTags,
  str,
} from "../_lib";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await parseJson(req);
  if (!body) return badRequest("Invalid JSON");
  if (!str(body.name, 128).trim()) return badRequest("Name is required");
  if (!str(body.categoryId, 64).trim()) return badRequest("Category is required");

  try {
    const item = await createItem({
      id: str(body.id, 128).trim() || undefined,
      categoryId: str(body.categoryId, 64),
      name: str(body.name, 128).trim(),
      price: sanitizePrice(body.price),
      description: str(body.description, 512),
      image: str(body.image, 512),
      tags: sanitizeTags(body.tags),
      status: sanitizeStatus(body.status),
      isVisible: body.isVisible !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : undefined,
    });
    revalidateMenu();
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    adminLog.error("item create failed", { error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
