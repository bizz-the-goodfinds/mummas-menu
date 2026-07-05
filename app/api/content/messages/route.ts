import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthorized } from "@/lib/auth";
import { getMessages, saveContent } from "@/lib/data";
import type { MessagesData } from "@/lib/types";

const ALLOWED_KEYS: Array<keyof MessagesData> = [
  "orderPrefix",
  "orderSuffix",
  "generalInquiry",
  "supportComplaint",
  "supportTrack",
  "supportFeedback",
];

export async function GET() {
  const messages = await getMessages();
  return NextResponse.json(messages);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = raw as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_KEYS) {
    if (typeof data[key] === "string") sanitized[key] = data[key];
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  await saveContent("messages", sanitized);
  revalidateTag("messages", { expire: 0 });
  // Site data embeds messages, so its cached copy must expire too.
  revalidateTag("site", { expire: 0 });
  return NextResponse.json({ ok: true });
}
