import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthorized } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ItemStatus } from "@/lib/types";
import { ITEM_STATUSES } from "@/lib/types";

export const adminLog = logger.child("admin-api");

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  if (!(await isAuthorized(req))) return unauthorized();
  return null;
}

/** Expire the public menu cache so admin edits go live on the next request. */
export function revalidateMenu() {
  revalidateTag("menu", { expire: 0 });
}

/* ── field sanitizers (shared by item/category routes) ──────────────────── */

export const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);

export function sanitizeStatus(v: unknown): ItemStatus {
  return ITEM_STATUSES.includes(v as ItemStatus) ? (v as ItemStatus) : "available";
}

export function sanitizePrice(v: unknown): number {
  return Math.max(0, Math.min(Number(v) || 0, 100_000));
}

export function sanitizeTags(v: unknown): string[] {
  return Array.isArray(v)
    ? v
        .map((t) => str(t, 32).trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];
}

export async function parseJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
