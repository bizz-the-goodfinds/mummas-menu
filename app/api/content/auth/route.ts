import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured on the server" }, { status: 500 });
  }
  if (password === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
}
