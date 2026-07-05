import { NextRequest, NextResponse } from "next/server";
import { softDeleteItem, updateItem } from "@/lib/menu-store";
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
} from "../../_lib";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await parseJson(req);
  if (!body) return badRequest("Invalid JSON");

  try {
    const item = await updateItem(id, {
      ...(body.categoryId !== undefined && { categoryId: str(body.categoryId, 64) }),
      ...(body.name !== undefined && { name: str(body.name, 128).trim() }),
      ...(body.price !== undefined && { price: sanitizePrice(body.price) }),
      ...(body.description !== undefined && { description: str(body.description, 512) }),
      ...(body.image !== undefined && { image: str(body.image, 512) }),
      ...(body.tags !== undefined && { tags: sanitizeTags(body.tags) }),
      ...(body.status !== undefined && { status: sanitizeStatus(body.status) }),
      ...(body.isVisible !== undefined && { isVisible: body.isVisible !== false }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 }),
      // deletedAt: null restores a soft-deleted item
      ...("deletedAt" in body && { deletedAt: body.deletedAt === null ? null : undefined }),
    });
    revalidateMenu();
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    adminLog.error("item update failed", { id, error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  try {
    await softDeleteItem(id);
    revalidateMenu();
    return NextResponse.json({ ok: true });
  } catch (e) {
    adminLog.error("item delete failed", { id, error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
