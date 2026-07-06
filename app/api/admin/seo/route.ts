import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSeoData, saveContent } from "@/lib/data";
import type { SeoData } from "@/lib/types";
import { adminLog, badRequest, parseJson, requireAdmin, str } from "../_lib";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json(await getSeoData());
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await parseJson(req);
  if (!body) return badRequest("Invalid JSON");

  const sanitized: SeoData = {
    metaTitle: str(body.metaTitle, 70),
    metaDescription: str(body.metaDescription, 170),
    keywords: Array.isArray(body.keywords)
      ? body.keywords
          .map((k) => str(k, 48).trim())
          .filter(Boolean)
          .slice(0, 24)
      : [],
    aiSummary: str(body.aiSummary, 1200),
    googleSiteVerification: str(body.googleSiteVerification, 128).trim(),
  };

  try {
    await saveContent("seo", sanitized);
    revalidateTag("seo", { expire: 0 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    adminLog.error("seo save failed", { error: (e as Error).message });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
