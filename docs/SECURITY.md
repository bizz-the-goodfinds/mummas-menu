# Security Model

## Authentication

Admin authentication is handled by **Supabase Auth** — a single admin user
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`, created by `npm run migrate`). Login flow:

1. The admin portal (unlisted route, see below) signs in directly against
   Supabase Auth with email + password via the browser client
   (`lib/supabase-browser.ts`, publishable key). Supabase issues a short-lived
   JWT access token plus a refresh token; supabase-js persists the session and
   refreshes it automatically.

2. Every admin API call sends the current access token in the `x-admin-token`
   header. The server (`isAuthorized()` in `lib/auth.ts`) verifies it by
   calling `supabaseAdmin.auth.getUser(token)` — a live check against
   Supabase, so revoked/expired sessions fail immediately.

3. Authorization requires `app_metadata.role === "admin"` on the user.
   `app_metadata` can only be set with the secret key (the migration script
   does this) — a user who somehow self-registered could never grant
   themselves the role, so they'd still be locked out of every admin API.

## Data access (RLS)

Both tables (`site_content`, `orders`) have **Row Level Security enabled with
no policies** — deny-all. The anon/publishable key can read and write
_nothing_. All data access goes through Next.js server code using the secret
key (`lib/supabase.ts`, guarded by `import "server-only"` so it can never be
bundled client-side). The browser's Supabase client is used exclusively for
authentication.

## Unlisted admin route

The admin panel lives at an unlisted path (`/mm-ops-admin`) instead of
`/admin`:

- Not linked from any page, excluded from the sitemap.
- `noindex, nofollow` robots metadata on the route layout.
- Deliberately **not** listed in `robots.txt` — a disallow line there would
  advertise the URL.

This is obscurity, not security — the real gate is Supabase Auth on every API
request. Anyone who finds the page still faces the login.

## Rate limiting

`proxy.ts` (Next.js 16's `middleware.ts` replacement) rate-limits
`POST /api/content/orders` — the only public write endpoint — to 10 requests
per 60-second sliding window per IP, using an in-memory `Map`. Best-effort on
serverless (per-pod counters). Admin login is rate-limited by Supabase Auth
itself.

## Write-endpoint hardening

- **Field allowlisting** — `PUT /api/content/site` and
  `PUT /api/content/messages` only persist allowlisted keys; anything else is
  silently dropped. The admin CRUD APIs (`/api/admin/items`,
  `/api/admin/categories`) sanitize and clamp every field (string caps, price
  clamp, status allowlist) before writing.
- **Body size limits** — site/menu PUTs reject bodies over `MAX_BODY_BYTES`
  before parsing; order POSTs cap at 16KB and 50 items.
- **JSON parse safety** — every route wraps `req.json()` in `try/catch` and
  returns `400` on malformed input.
- **Media upload** — `POST /api/content/media` requires admin auth and
  validates size (max 4MB) and MIME type (`jpeg`/`png`/`webp`) before
  uploading to Supabase Storage. Filenames are sanitized and prefixed with a
  timestamp under `uploads/` in the bucket.
- **Order logging** — `POST /api/content/orders` is public (called from
  checkout) but sanitizes and clamps every field, and never blocks checkout
  if the insert fails.

## Backups

`npm run backup` (CLI) and the admin panel's Backups page both encrypt dumps
with AES-256-GCM using `BACKUP_ENCRYPTION_KEY`. CLI backups land in
`backups/` (safe to commit to this public repo **only because** they're
encrypted); admin-panel backups go to the private `backups` storage bucket
with short-lived signed download links. Keep the key in `.env` (git-ignored)
and in a password manager; without it a backup cannot be restored. Restore is
CLI-only (`npm run restore`) by design.

## HTTP security headers

`next.config.ts` sets CSP, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, and `Permissions-Policy` on every response. The CSP
`connect-src`/`img-src` include the Supabase project URL (auth calls from the
admin portal; menu images served from Storage).

## Deployment checklist (Vercel)

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
      and `SUPABASE_SECRET_KEY` as Vercel Project Environment Variables
      (Production **and** Preview). `SUPABASE_DB_URL` and
      `BACKUP_ENCRYPTION_KEY` are only needed locally for scripts.
- [ ] Never expose `SUPABASE_SECRET_KEY` to the browser (no `NEXT_PUBLIC_`
      prefix, ever).
- [ ] Use a strong `ADMIN_PASSWORD`; rotate by editing `.env` and re-running
      `npm run migrate` (it updates the existing user's password).
- [ ] In Supabase Dashboard → Authentication → Sign In / Up, consider
      disabling public sign-ups entirely (the app never needs them; the role
      check already locks non-admin users out, this is belt-and-braces).
- [ ] Run `npm run backup` regularly and commit the encrypted file.
