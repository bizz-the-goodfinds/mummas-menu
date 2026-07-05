import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createBackupBuffer, BACKUPS_BUCKET } from "@/scripts/lib/backup-core.mjs";
import { adminLog, requireAdmin } from "../_lib";

// Admin backup management: create an encrypted backup into the private
// "backups" storage bucket, and list existing ones with short-lived
// download links. Restore stays CLI-only (npm run restore) on purpose —
// it's destructive and deserves a terminal confirmation.

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { data, error } = await supabaseAdmin.storage
    .from(BACKUPS_BUCKET)
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });

  const backups = await Promise.all(
    (data ?? [])
      .filter((f) => f.name.endsWith(".mmbk"))
      .map(async (f) => {
        const { data: signed } = await supabaseAdmin.storage
          .from(BACKUPS_BUCKET)
          .createSignedUrl(f.name, 60 * 10); // 10-minute download link
        return {
          name: f.name,
          createdAt: f.created_at,
          bytes: f.metadata?.size ?? null,
          downloadUrl: signed?.signedUrl ?? null,
        };
      }),
  );

  return NextResponse.json({ backups });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
  if (!url || !secretKey || !encryptionKey) {
    return NextResponse.json(
      { error: "BACKUP_ENCRYPTION_KEY is not configured on the server" },
      { status: 503 },
    );
  }

  try {
    const { buffer, meta } = await createBackupBuffer({
      supabaseUrl: url,
      secretKey,
      encryptionKey,
      withImages: false,
    });
    const stamp = meta.createdAt.replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
    const filename = `backup-${stamp}.mmbk`;

    const { error } = await supabaseAdmin.storage
      .from(BACKUPS_BUCKET)
      .upload(filename, buffer, { contentType: "application/octet-stream" });
    if (error) return NextResponse.json({ error: error.message }, { status: 502 });

    adminLog.info("backup created from admin", { filename, bytes: meta.bytes });
    return NextResponse.json({ ok: true, filename, meta });
  } catch (e) {
    adminLog.error("backup failed", { error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
