import { NextRequest, NextResponse } from "next/server";
import { softDeleteCategory, updateCategory } from "@/lib/menu-store";
import { adminLog, badRequest, parseJson, requireAdmin, revalidateMenu, str } from "../../_lib";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await parseJson(req);
  if (!body) return badRequest("Invalid JSON");

  try {
    const category = await updateCategory(id, {
      ...(body.slug !== undefined && { slug: str(body.slug, 64).trim() }),
      ...(body.name !== undefined && { name: str(body.name, 64).trim() }),
      ...(body.emoji !== undefined && { emoji: str(body.emoji, 8) }),
      ...(body.isVisible !== undefined && { isVisible: body.isVisible !== false }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 }),
      ...("deletedAt" in body && { deletedAt: body.deletedAt === null ? null : undefined }),
    });
    revalidateMenu();
    return NextResponse.json({ ok: true, category });
  } catch (e) {
    adminLog.error("category update failed", { id, error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;

  try {
    await softDeleteCategory(id);
    revalidateMenu();
    return NextResponse.json({ ok: true });
  } catch (e) {
    adminLog.error("category delete failed", { id, error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
