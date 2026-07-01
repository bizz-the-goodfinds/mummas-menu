# Mumma's Menu — Cloud Kitchen Website

A Next.js 16 PWA for Mumma's Menu, a 100% pure-veg FSSAI-approved homestyle cloud kitchen in Vadodara. Orders are placed via WhatsApp. Includes an admin portal for managing menu, content, and orders.

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Analytics** — Firebase Analytics (GA4)
- **PWA** — Service worker + Web App Manifest

---

## Getting Started

```bash
npm install
cp .env.example .env       # fill in your values (see Environment Variables below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

| Variable                                   | Required | Description                            |
| ------------------------------------------ | -------- | -------------------------------------- |
| `ADMIN_PASSWORD`                           | Yes      | Password for the `/admin` portal       |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Yes      | Firebase web config                    |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes      | Firebase web config                    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Yes      | Firebase web config                    |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Yes      | Firebase web config                    |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes      | Firebase web config                    |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Yes      | Firebase web config                    |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Yes      | GA4 Measurement ID (e.g. `G-XXXXXXXX`) |

All `NEXT_PUBLIC_*` variables are intentionally browser-visible — this is by Firebase's web SDK design, not a security issue.

To get Firebase values: **Firebase Console → Project Settings → Your apps → Web app → SDK setup**.

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

| Event                               | Trigger                                 |
| ----------------------------------- | --------------------------------------- |
| `whatsapp_float_click`              | Floating WhatsApp button clicked        |
| `pwa_install_prompted`              | Install-to-home-screen banner shown     |
| `pwa_install_accepted`              | User installs the PWA                   |
| `pwa_install_dismissed`             | User dismisses the install banner       |
| `app_exception`                     | Unhandled JS error or promise rejection |
| Web Vitals (`lcp`, `cls`, `inp`, …) | Reported automatically on each page     |

### Error tracking (web Crashlytics equivalent)

Firebase Crashlytics is mobile-only and does not exist for web. The `instrumentation-client.ts` file registers global `error` and `unhandledrejection` listeners that forward crashes to Firebase Analytics as `app_exception` events. View them in **Firebase Console → Analytics → Events → app_exception**.

---

## Project Structure

```
app/                 Next.js App Router pages & layouts
  layout.tsx         Root layout (fonts, JSON-LD, providers)
  page.tsx           Home page
  menu/              Full menu page
  about/             About page
  contact/           Contact page
  trust/             FSSAI trust page
  admin/             Admin portal (password-protected)
  api/               API routes (content, orders, media)

components/          Shared UI components
  ui/                Primitive UI pieces (ItemCard, QtyButton, …)
  admin/             Admin portal tabs

lib/
  firebase.ts        Firebase app init (browser-safe singleton)
  analytics.ts       Typed event tracking helpers
  cart-context.tsx   Cart state (React context)
  data.ts            Content data loaders
  types.ts           Shared TypeScript types
  whatsapp.ts        WhatsApp message builders

data/                JSON content files (menu, site config)
public/              Static assets, service worker, fonts
instrumentation-client.ts   Global error tracking (runs before app boots)

docs/
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
```

---

## Admin Portal

Visit `/admin` and enter the `ADMIN_PASSWORD`. Tabs available:

- **Menu** — add/edit/delete categories and items
- **Site** — edit brand info, hours, FAQs, testimonials
- **Orders** — view incoming WhatsApp orders
- **Messages** — manage message templates
- **Media** — upload and manage images

---

## Deployment

Any platform that supports Next.js works. Set all environment variables from `.env.example` in your hosting provider's dashboard before deploying.

Recommended: [Vercel](https://vercel.com) (zero-config Next.js support).
