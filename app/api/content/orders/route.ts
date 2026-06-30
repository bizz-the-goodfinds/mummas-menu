import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendOrder, getOrders } from "@/lib/data";
import { isAuthorized } from "@/lib/auth";
import type { CartLine, OrderEntry } from "@/lib/types";

const MAX_BODY_BYTES = 16_000;
const MAX_ITEMS = 50;

function sanitizeLine(line: unknown): CartLine | null {
  const l = line as Record<string, unknown>;
  const id = String(l.id ?? "").slice(0, 128);
  const name = String(l.name ?? "").slice(0, 128);
  if (!id || !name) return null;
  return {
    id,
    name,
    price: Math.max(0, Math.min(Number(l.price) || 0, 100_000)),
    qty: Math.max(1, Math.min(Math.trunc(Number(l.qty) || 1), 999)),
    emoji: String(l.emoji ?? "").slice(0, 8),
    image: l.image ? String(l.image).slice(0, 512) : undefined,
  };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const log = await getOrders();
  return NextResponse.json(log);
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const items = (body.items as unknown[])
    .slice(0, MAX_ITEMS)
    .map(sanitizeLine)
    .filter((l): l is CartLine => l !== null);

  if (items.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const total = items.reduce((sum, l) => sum + l.price * l.qty, 0);
  const order: OrderEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    items,
    total,
    source: String(body.source ?? "Website").slice(0, 128),
  };

  try {
    await appendOrder(order);
  } catch {
    // Best-effort logging only (e.g. read-only filesystem on serverless) —
    // the WhatsApp checkout message already has the full order, so failing
    // to log it here should never block the customer.
  }

  return NextResponse.json({ ok: true, id: order.id });
}
