import { NextRequest, NextResponse } from "next/server";
import { createCategory } from "@/lib/menu-store";
import { adminLog, badRequest, parseJson, requireAdmin, revalidateMenu, str } from "../_lib";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await parseJson(req);
  if (!body) return badRequest("Invalid JSON");
  if (!str(body.name, 64).trim()) return badRequest("Name is required");

  try {
    const category = await createCategory({
      slug: str(body.slug, 64).trim() || undefined,
      name: str(body.name, 64).trim(),
      emoji: str(body.emoji, 8),
      isVisible: body.isVisible !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : undefined,
    });
    revalidateMenu();
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (e) {
    adminLog.error("category create failed", { error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
