# Setup

## Requirements

- Node.js 20+
- npm

## First run

```bash
npm install
cp .env.example .env   # then edit ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable         | Required | Purpose                                                                |
| ---------------- | -------- | ---------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | Yes      | Login password for `/admin` and the signing secret for session tokens. |

Set `ADMIN_PASSWORD` in `.env` for local dev, and as a Project Environment Variable in
Vercel (Settings → Environment Variables) for production/preview deploys. Without it,
`/api/content/auth` responds `503` and `/admin` login is disabled.

## Admin login

1. Go to `/admin`.
2. Enter the value of `ADMIN_PASSWORD`.
3. A signed, expiring session token (12h TTL) is issued and stored in
   `sessionStorage` — the raw password is never persisted client-side. See
   [SECURITY.md](./SECURITY.md) for how the token is verified.

## Useful scripts

```bash
npm run dev          # local dev server (Turbopack)
npm run build        # production build + type check
npm run start         # run the production build locally
npm run lint          # ESLint
npm run lint:fix       # ESLint --fix
npm run format         # Prettier --write
npm run format:check   # Prettier --check (CI-friendly)
npm run type-check     # tsc --noEmit
```

A pre-commit hook (Husky + lint-staged) runs Prettier/ESLint automatically on staged
files — no manual step needed before committing.

## Deploying to Vercel

This project is built for Vercel's serverless runtime:

- Import the repo in Vercel, set `ADMIN_PASSWORD` as an environment variable, deploy.
- The admin panel writes content to local JSON files under `data/` via `fs.writeFile`.
  This **works in local dev and on a single persistent Node server**, but Vercel's
  serverless filesystem is **read-only at runtime and not shared across instances or
  deploys** — admin edits made in production will not persist reliably. For a real
  production deployment, swap the file-based storage in `lib/data.ts` for a database or
  KV store (Vercel KV / Postgres / etc.) — the read/write surface is small and isolated
  to that one file. Image uploads (`/api/content/media`) have the same constraint; until
  swapped for object storage (e.g. Vercel Blob), use external image URLs in production.
