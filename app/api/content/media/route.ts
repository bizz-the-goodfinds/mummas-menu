import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthorized } from "@/lib/auth";

const MAX_FILE_BYTES = 4_000_000;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const uploadDir = path.join(process.cwd(), "public", "images", "uploads");

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .slice(0, 64);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
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

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);
  } catch {
    return NextResponse.json(
      {
        error:
          "This server's filesystem is read-only (e.g. Vercel serverless), so local uploads aren't supported here. Paste an external image URL instead.",
      },
      { status: 501 },
    );
  }

  return NextResponse.json({ ok: true, path: `/images/uploads/${filename}` });
}
