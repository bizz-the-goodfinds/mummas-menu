import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const candidate = typeof body.password === "string" ? body.password : "";

  if (checkPassword(candidate)) {
    const token = createSessionToken();
    return NextResponse.json({ ok: true, token });
  }

  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
  return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
}
