# Security Model

## Authentication

There is a single shared admin password (`ADMIN_PASSWORD` env var) — no per-user
accounts. Login flow:

1. `POST /api/content/auth` with `{ password }`.
   - If `ADMIN_PASSWORD` isn't set, responds `503` (fails closed, doesn't leak whether
     a password would have worked).
   - Compares the candidate against `ADMIN_PASSWORD` with `crypto.timingSafeEqual`
     (constant-time, avoids timing side-channels) — see `checkPassword()` in
     `lib/auth.ts`.
   - On failure, sleeps 300–500ms (randomized) before responding `401`, to slow down
     brute-force attempts.
   - On success, issues a **session token**, not the raw password.

2. The session token is a **stateless, self-verifying HMAC token**:
   `<expiry-timestamp>.<hmac-sha256-signature>` — see `createSessionToken()` /
   `verifySessionToken()` in `lib/auth.ts`. The signature is computed over the expiry
   timestamp, keyed with `ADMIN_PASSWORD` as the HMAC secret. Verifying a token means
   recomputing the HMAC and comparing with `timingSafeEqual` — no server-side session
   store is involved.

   **Why stateless:** the site runs on Vercel serverless, where each request can land
   on a different, memory-isolated function instance with no shared state. An
   in-memory token store (e.g. a `Map` of valid tokens) would not work reliably — a
   token issued by one instance might be checked against a different instance that
   never saw it. The HMAC scheme sidesteps this entirely: any instance holding
   `ADMIN_PASSWORD` can independently verify any token issued by any other instance.

3. Tokens expire 12 hours after issue (`TOKEN_TTL_MS` in `lib/auth.ts`) and are stored
   client-side in `sessionStorage` (cleared on logout / tab close) — never `localStorage`,
   never a cookie.

4. Every authenticated write (`PUT /api/content/menu`, `PUT /api/content/site`,
   `POST /api/content/media`, `GET /api/content/orders`) calls `isAuthorized(req)`,
   which reads the `x-admin-token` header and runs `verifySessionToken()`.

## Rate limiting

`proxy.ts` (Next.js 16's `middleware.ts` replacement — see the project's `AGENTS.md`
for why the rename matters) rate-limits `POST /api/content/auth` to 10 requests per
60-second sliding window per IP, using an in-memory `Map`. This is **best-effort**: on
Vercel serverless, each pod keeps its own independent counter, so the real-world limit
is "10 requests per window, per pod the request happens to land on" rather than a hard
global cap. For stricter enforcement, swap the `Map` for a shared store (e.g. Upstash
Redis) — the `rateLimit()` function in `proxy.ts` is the only place that would need to
change.

## Write-endpoint hardening

- **Field allowlisting** — `PUT /api/content/site` only persists keys listed in
  `ALLOWED_KEYS` (`app/api/content/site/route.ts`); any other field in the request body
  is silently dropped. This prevents prototype-pollution-style or arbitrary-field
  injection via a crafted payload.
- **Body size limits** — site/menu PUTs reject bodies over `MAX_BODY_BYTES` (128KB)
  before parsing; order POSTs cap at 16KB and 50 items (`MAX_BODY_BYTES` /
  `MAX_ITEMS` in `app/api/content/orders/route.ts`).
- **JSON parse safety** — every route wraps `req.json()` in a `try/catch` and returns
  `400` on malformed input instead of throwing a raw 500.
- **Media upload** — `POST /api/content/media` validates file presence, size
  (`MAX_FILE_BYTES` = 4MB), and MIME type against an allowlist (`jpeg`/`png`/`webp`)
  before writing. Filenames are sanitized. On a read-only filesystem (Vercel
  production), the write fails gracefully with `501` and a message to use an external
  image URL instead — see [CONTENT.md](./CONTENT.md).
- **Order logging** — `POST /api/content/orders` is public (called from checkout, no
  auth) but sanitizes and clamps every field (string length caps, numeric clamps) and
  is wrapped in a try/catch that never blocks the checkout flow even if the write fails.

## HTTP security headers

`next.config.ts` sets CSP, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, and `Permissions-Policy` on every response.

## Deployment checklist (Vercel)

- [ ] Set `ADMIN_PASSWORD` as a Vercel Project Environment Variable (Production **and**
      Preview) — without it, `/api/content/auth` returns 503 and the admin panel is
      unusable.
- [ ] Use a strong, unique password — it's both the login credential and the HMAC
      signing secret for session tokens.
- [ ] Confirm `data/*.json` writes are acceptable for your use case: Vercel's
      filesystem is read-only at runtime and not shared/persisted across deploys or
      instances, so admin saves and order logging won't reliably persist in
      production. For real production use, replace the file-based reads/writes in
      `lib/data.ts` with a database or KV store (see [SETUP.md](./SETUP.md)).
- [ ] Image uploads via the Media tab will return `501` on Vercel — use external image
      URLs (Unsplash, your own CDN, Vercel Blob, etc.) instead.
- [ ] Rotate `ADMIN_PASSWORD` periodically; rotating it immediately invalidates all
      previously issued session tokens (since they're signed with the old secret).
