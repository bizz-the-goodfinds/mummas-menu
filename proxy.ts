import { NextRequest, NextResponse } from "next/server";

// Simple in-process sliding-window rate limiter for the auth endpoint.
// On Vercel serverless each pod is independent, so this is best-effort
// protection — good enough for low-traffic sites. Swap for Upstash Redis
// for stricter enforcement across pods.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const hits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const window = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  window.push(now);
  hits.set(ip, window);
  return window.length <= MAX_REQUESTS;
}

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/content/auth" && req.method === "POST") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (!rateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" },
      });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/content/auth"],
};
