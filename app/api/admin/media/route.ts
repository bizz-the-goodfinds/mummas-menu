import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, IMAGES_BUCKET, storagePublicUrl } from "@/lib/supabase";
import { adminLog, badRequest, parseJson, requireAdmin } from "../_lib";

interface MediaFile {
  path: string;
  url: string;
  bytes: number | null;
  createdAt: string | null;
}

async function listRecursive(prefix: string): Promise<MediaFile[]> {
  const { data, error } = await supabaseAdmin.storage
    .from(IMAGES_BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) throw new Error(`list ${prefix || "/"}: ${error.message}`);

  const files: MediaFile[] = [];
  for (const entry of data ?? []) {
    const full = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      files.push(...(await listRecursive(full)));
    } else {
      files.push({
        path: full,
        url: storagePublicUrl(full),
        bytes: entry.metadata?.size ?? null,
        createdAt: entry.created_at ?? null,
      });
    }
  }
  return files;
}

// Full listing of the images bucket for the admin media manager.
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const files = await listRecursive("");
    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

// Delete one file. The UI warns that dishes still pointing at the URL will
// lose their image — content refs are not auto-cleaned on purpose.
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await parseJson(req);
  const path = typeof body?.path === "string" ? body.path.trim() : "";
  if (!path || path.includes("..")) return badRequest("A valid file path is required");

  const { error } = await supabaseAdmin.storage.from(IMAGES_BUCKET).remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  adminLog.info("media deleted", { path });
  return NextResponse.json({ ok: true });
}
