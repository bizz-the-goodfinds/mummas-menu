import { createHmac, timingSafeEqual } from "crypto";

const ALGO = "sha256";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not configured");
  return s;
}

function sign(payload: string): string {
  return createHmac(ALGO, secret()).update(payload).digest("hex");
}

// Stateless, self-verifying session token: `<expiry>.<hmac signature>`.
// No server-side session store, so this stays valid on Vercel serverless
// where each request may land on a different, memory-isolated instance.
export function createSessionToken(): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  return `${expires}.${sign(String(expires))}`;
}

export function verifySessionToken(token: string): boolean {
  const [expiresStr, sig] = token.split(".");
  if (!expiresStr || !sig) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  let expectedSig: string;
  try {
    expectedSig = sign(expiresStr);
  } catch {
    return false;
  }

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  try {
    const a = Buffer.from(candidate.padEnd(72));
    const b = Buffer.from(pw.padEnd(72));
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAuthorized(req: Request): boolean {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!token) return false;
  return verifySessionToken(token);
}
