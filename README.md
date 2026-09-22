# Mumma's Menu — Cloud Kitchen Website

A Next.js 16 PWA for Mumma's Menu, a 100% pure-veg FSSAI-approved homestyle cloud kitchen in Vadodara. Orders are placed via WhatsApp. Includes an admin portal for managing menu, content, and orders.

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Data & Auth** — Supabase (Postgres content store, Storage for images, Auth for the admin portal)
- **Analytics** — Firebase Analytics (GA4)
- **PWA** — Service worker + Web App Manifest

---

## Getting Started

```bash
npm install
cp .env.example .env       # fill in your values (see Environment Variables below)
npm run migrate            # one-time: create schema + admin user + seed content in Supabase
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

| Variable                                   | Required    | Description                                                                                                                             |
| ------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                 | Yes         | Supabase project URL (Project Settings → API)                                                                                           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`     | Yes         | Supabase publishable key — browser-safe, used only for admin login                                                                      |
| `SUPABASE_SECRET_KEY`                      | Yes         | Supabase secret key — server-only, bypasses RLS for content reads/writes                                                                |
| `SUPABASE_DB_URL`                          | Scripts     | Direct Postgres connection string — used only by `npm run migrate`                                                                      |
| `ADMIN_EMAIL`                              | Yes         | Email of the Supabase Auth admin user (created by `npm run migrate`)                                                                    |
| `ADMIN_PASSWORD`                           | Yes         | Password of the Supabase Auth admin user                                                                                                |
| `BACKUP_ENCRYPTION_KEY`                    | Scripts     | 64-hex-char AES key for `npm run backup` / `npm run restore` (`openssl rand -hex 32`)                                                   |
| `SITE_URL`                                 | Recommended | Canonical public URL (e.g. `https://mummasmenu.in`). Used in WhatsApp messages & JSON-LD. Falls back to `VERCEL_URL` → stored site data |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Yes         | Firebase web config                                                                                                                     |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes         | Firebase web config                                                                                                                     |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Yes         | Firebase web config                                                                                                                     |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Yes         | Firebase web config                                                                                                                     |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes         | Firebase web config                                                                                                                     |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Yes         | Firebase web config                                                                                                                     |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Yes         | GA4 Measurement ID (e.g. `G-XXXXXXXX`)                                                                                                  |

All `NEXT_PUBLIC_*` variables are intentionally browser-visible — this is by Firebase's web SDK design, not a security issue.

To get Firebase values: **Firebase Console → Project Settings → Your apps → Web app → SDK setup**.

**`SITE_URL` resolution order** (first set wins):

1. `SITE_URL` — set to your custom domain on production
2. `VERCEL_URL` — auto-set by Vercel on every deployment (prefix `https://` is added automatically)
3. `siteUrl` in `data/site.json` — local dev fallback

---

## Analytics & Tracking

Firebase Analytics (GA4) is integrated. Events are tracked automatically — no extra setup needed beyond the env vars.

### Standard GA4 ecommerce events

| Event              | Trigger                       |
| ------------------ | ----------------------------- |
| `add_to_cart`      | User adds any item            |
| `remove_from_cart` | User removes any item         |
| `view_cart`        | Cart drawer opens             |
| `view_item`        | Item detail sheet opens       |
| `begin_checkout`   | "Checkout on WhatsApp" tapped |

### Custom events

| Event                               | Trigger                                   |
| ----------------------------------- | ----------------------------------------- |
| `whatsapp_float_click`              | Floating WhatsApp button clicked          |
| `ask_ai_click`                      | ChatGPT/Claude/Gemini button on `/ask-ai` |
| `pwa_install_prompted`              | Install-to-home-screen banner shown       |
| `pwa_install_accepted`              | User installs the PWA                     |
| `pwa_install_dismissed`             | User dismisses the install banner         |
| `app_exception`                     | Unhandled JS error or promise rejection   |
| Web Vitals (`lcp`, `cls`, `inp`, …) | Reported automatically on each page       |

### Error tracking (web Crashlytics equivalent)

Firebase Crashlytics is mobile-only and does not exist for web. The `instrumentation-client.ts` file registers global `error` and `unhandledrejection` listeners that forward crashes to Firebase Analytics as `app_exception` events. View them in **Firebase Console → Analytics → Events → app_exception**.

---

## Project Structure

```
app/                 Next.js App Router pages & layouts
  layout.tsx         Root layout (fonts, JSON-LD, providers)
  page.tsx           Home page
  menu/              Full menu page
  contact/           Contact page
  ask-ai/            "Ask AI about us" page (ChatGPT / Claude / Gemini)
  llms.txt/          Live plain-text business feed for AI assistants (GEO)
  mm-ops-admin/      Admin panel (unlisted route, Supabase Auth, sidebar UI)
  api/               Public API routes (content, orders, media)
  api/admin/         Admin CRUD APIs (items, categories, menu, backups)
  loading.tsx        Skeleton loading states (also in menu/, contact/)

components/          Shared UI components
  ui/                Primitive UI pieces (ItemCard, QtyButton, Skeleton, …)
  admin/             Admin portal tabs

lib/
  supabase.ts        Server-only Supabase client (secret key) + storage helpers
  menu-store.ts      Menu reads + CRUD against the normalized tables
  logger.ts          Structured logger (pretty in dev, JSON in production)
  supabase-browser.ts Browser Supabase client (publishable key, admin login only)
  firebase.ts        Firebase app init (browser-safe singleton)
  analytics.ts       Typed event tracking helpers
  auth.ts            Admin request authorization (Supabase JWT verification)
  cart-context.tsx   Cart state (React context)
  data.ts            Site/messages/orders loaders (Supabase + cache tags)
  seo.ts             LocalBusiness / WebSite JSON-LD + 24-hour hours helper
  haptics.ts         Vibration feedback helper (best-effort, PWA)
  types.ts           Shared TypeScript types
  use-overlay.ts     Overlay hook: body scroll lock + back-gesture close
  whatsapp.ts        WhatsApp message builders

scripts/
  migrate-to-supabase.mjs  Modular setup/migration (run all or --only <modules>)
  generate-assets.mjs      Regenerates OG image + PWA icons from the logo
  backup.mjs         Encrypted backup → backups/*.mmbk (and optionally Storage)
  restore.mjs        Restore a backup file into Supabase
  e2e.mjs            End-to-end test suite (runs against a production build)
  lib/backup-core.mjs      Shared backup engine (CLI + admin API)

data/                Seed JSON used by npm run migrate (live data lives in Supabase)
backups/             Encrypted database backups (safe to commit — AES-256-GCM)
public/              Static assets, service worker, fonts
instrumentation-client.ts   Global error tracking (runs before app boots)

docs/
  SEO.md             SEO/AEO/GEO setup + how to check indexing
  ADDING-CONTENT.md  Plain-English guide for non-technical users (add items, categories, photos)
  CONTENT.md         Developer reference for data/menu.json and data/site.json shape
  SETUP.md           Local dev setup steps
  WHATSAPP.md        WhatsApp message template reference
  PWA.md             PWA / service worker notes
  SECURITY.md        Security notes
```

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier
npm run migrate      # Supabase setup/migration (all modules, or -- --only schema,images)
npm run generate-assets  # Rebuild OG image + PWA icons from the logo
npm run backup       # Encrypted DB backup → backups/ (add --with-images for storage files)
npm run restore      # Restore a backup: npm run restore -- backups/<file>
npm run e2e          # End-to-end tests (run npm run build first)
```

---

## Admin Panel

A full admin panel lives at `/mm-ops-admin` (unlisted — not linked anywhere, `noindex`, excluded from the sitemap). Log in with the Supabase Auth admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, created by `npm run migrate`). Sidebar sections:

- **Dashboard** — item health, order stats, recent orders
- **Menu Items** — searchable/sortable/paginated table with category & status filters, dedicated add/edit pages with a **live customer-view preview**, image upload, soft delete + recycle bin restore
- **Categories** — same CRUD treatment, with slug/order/visibility control
- **Orders** — sortable table + CSV export
- **Site Content** — every field: brand, contact, address, social, about, FAQs, testimonials, FSSAI, hours, support/retention
- **SEO & AI** — meta title/description/keywords with Google preview, AI summary for `/llms.txt`, and a Search Console indexing checklist (HTML-file verification is already on the site)
- **WhatsApp Messages** — templates with live WhatsApp-bubble previews
- **Media** — full storage manager: browse, search, upload, copy URL, delete
- **Backups** — one-click encrypted backup into a private Storage bucket, with download links

Every item carries `isVisible` (hide without deleting), a `status` (`available`, `coming-soon`, `out-of-stock`, `festive-special` — non-orderable statuses show a badge and disable Add), and `createdAt`/`updatedAt`/`deletedAt` timestamps. Every save expires the site's content cache, so changes are live immediately.

---

## Deployment

Any platform that supports Next.js works. Set all environment variables from `.env.example` in your hosting provider's dashboard before deploying (`SUPABASE_DB_URL` and `BACKUP_ENCRYPTION_KEY` are only needed locally for scripts).

Because all content, images, and orders live in Supabase, admin edits persist correctly on serverless hosting — no filesystem writes remain.

Recommended: [Vercel](https://vercel.com) (zero-config Next.js support).
