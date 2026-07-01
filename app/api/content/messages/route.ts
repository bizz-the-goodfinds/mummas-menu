import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthorized } from "@/lib/auth";
import { getMessages } from "@/lib/data";
import type { MessagesData } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "messages.json");

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
  if (!isAuthorized(req)) {
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

  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2) + "\n", "utf-8");
  return NextResponse.json({ ok: true });
}
