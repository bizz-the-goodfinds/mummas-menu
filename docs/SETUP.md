# Setup

## Requirements

- Node.js 20+ (22+ recommended — scripts use `node --env-file`)
- npm
- A [Supabase](https://supabase.com) project (free tier is fine)

## First run

```bash
npm install
cp .env.example .env   # fill in Supabase keys + ADMIN_EMAIL/ADMIN_PASSWORD
npm run migrate        # one-time: schema, storage bucket, admin user, seed data
npm run dev
```

Open http://localhost:3000.

`npm run migrate` is modular and idempotent — safe to re-run. It creates all
tables (`site_content`, `orders`, `categories`, `menu_items` — RLS deny-all,
`updated_at` triggers), the `images` (public) and `backups` (private) storage
buckets, the admin user (from `ADMIN_EMAIL`/`ADMIN_PASSWORD`), normalizes the
menu into the tables, optimizes every content image to webp (~40KB each, 1-year
cache-control) and uploads it, and upgrades the local seed JSON to the current
shape. Run a subset with e.g.:

```bash
npm run migrate -- --only schema,images   # just those modules
npm run migrate -- --only menu-data --force  # reseed menu tables from scratch
```

Modules: `schema`, `buckets`, `auth`, `content`, `menu-data`, `images`,
`orders`, `local-json`.

## Environment variables

| Variable                               | Required | Purpose                                                               |
| -------------------------------------- | -------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | Supabase project URL                                                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Browser-safe key, used only for admin login                           |
| `SUPABASE_SECRET_KEY`                  | Yes      | Server-only key for all data reads/writes (bypasses RLS)              |
| `SUPABASE_DB_URL`                      | Scripts  | Direct Postgres connection — `npm run migrate` only                   |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`       | Yes      | Admin portal login (Supabase Auth user, created by `npm run migrate`) |
| `BACKUP_ENCRYPTION_KEY`                | Scripts  | AES key for `npm run backup` / `npm run restore`                      |
| `SITE_URL`                             | Rec.     | Canonical public URL for WhatsApp messages / JSON-LD                  |
| `NEXT_PUBLIC_FIREBASE_*`               | Yes      | Firebase Analytics web config                                         |

## Admin login

1. Go to `/mm-ops-admin` (unlisted — bookmark it).
2. Enter `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Supabase Auth issues a session that supabase-js keeps refreshed; every
   admin API call is verified server-side against Supabase. See
   [SECURITY.md](./SECURITY.md).

To change the password: edit `ADMIN_PASSWORD` in `.env` and re-run
`npm run migrate`.

## Useful scripts

```bash
npm run dev            # local dev server (Turbopack)
npm run build          # production build + type check
npm run start          # run the production build locally
npm run lint           # ESLint
npm run lint:fix       # ESLint --fix
npm run format         # Prettier --write
npm run format:check   # Prettier --check (CI-friendly)
npm run type-check     # tsc --noEmit
npm run migrate        # Supabase setup/migration (modular; see above)
npm run generate-assets # rebuild OG image + PWA icons from the logo
npm run backup         # encrypted DB backup → backups/ (--with-images, --to-storage)
npm run restore        # npm run restore -- backups/<file>
npm run e2e            # end-to-end tests against a production build
```

A pre-commit hook (Husky + lint-staged) runs Prettier/ESLint automatically on staged
files — no manual step needed before committing.

## Backups

`npm run backup` writes an encrypted snapshot (content, orders, user list,
optionally all images) to `backups/`. The file is AES-256-GCM encrypted with
`BACKUP_ENCRYPTION_KEY`, so it's safe to commit and push even though the repo
is public. Restore with `npm run restore -- backups/<file>` (asks for
confirmation; add `--yes` to skip). Keep the key somewhere safe outside git —
without it, backups are unrecoverable.

## Deploying to Vercel

- Import the repo in Vercel and set the env vars from the table above
  (`SUPABASE_DB_URL` and `BACKUP_ENCRYPTION_KEY` can be omitted — they're
  only used by local scripts).
- All content, orders, and images live in Supabase, so admin edits and
  uploads persist correctly on Vercel's serverless runtime — the old
  read-only-filesystem limitation is gone.
- Content is cached for 5 minutes with tag-based invalidation: admin saves
  push changes live immediately; direct database edits (e.g. a restore) show
  up within 5 minutes.
