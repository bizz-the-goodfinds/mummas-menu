import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { supabaseAdmin, IMAGES_BUCKET, storagePublicUrl } from "@/lib/supabase";

const MAX_FILE_BYTES = 4_000_000;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .slice(0, 64);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 413 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type — use JPEG, PNG or WebP" },
      { status: 415 },
    );
  }

  const filename = `${Date.now()}-${safeName(file.name.replace(/\.[^.]+$/, "")) || "image"}.${ext}`;
  const storagePath = `uploads/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage.from(IMAGES_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
  });
  if (error) {
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 502 });
  }

  // Returns a permanent public URL on Supabase Storage — works on Vercel too,
  // unlike the old local-filesystem uploads.
  return NextResponse.json({ ok: true, path: storagePublicUrl(storagePath) });
}
