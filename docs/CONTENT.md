# Editing Content

All site copy, contact info, and the menu are config-driven JSON files under `data/`.
You can edit them two ways:

1. **Admin panel** (`/admin`) — Menu Editor and Site Editor tabs, no code changes needed.
2. **Directly** — edit `data/menu.json` / `data/site.json` and redeploy.

## `data/menu.json`

```json
{
  "categories": [
    {
      "slug": "starters",
      "name": "Starters",
      "emoji": "🥗",
      "items": [
        {
          "id": "paneer-tikka",
          "name": "Paneer Tikka",
          "price": 220,
          "veg": true,
          "description": "Char-grilled cottage cheese, smoky masala.",
          "image": "https://images.unsplash.com/photo-...",
          "tags": ["bestseller"]
        }
      ]
    }
  ]
}
```

- `slug` is used in the URL (`/menu/<slug>`) and must be unique — the admin Menu Editor
  derives it from the category name automatically.
- `tags` is a free-form string array; `"bestseller"` and `"new"` get special badge
  styling in `components/ui/Badge.tsx` — any other tag still renders as a plain badge.
- `veg` drives the green/red veg-indicator dot.

### Images

`image` accepts either:

- An **external URL** (e.g. Unsplash, Pexels, your own CDN) — works everywhere,
  including Vercel. This is the recommended option for production.
- A **local path** under `/images/...` (served from `public/`) — only reliable in local
  dev or a persistent server; see the Vercel filesystem note in
  [SETUP.md](./SETUP.md).

Any new external image domain must be added to `images.remotePatterns` in
`next.config.ts`, or Next's image optimizer will reject it.

The admin Media tab (`/admin` → Media) can upload a local image and gives you back a
path to paste into the `image` field — but only works on a writable filesystem (local
dev). On Vercel it returns a 501 with a message to use an external URL instead.

## `data/site.json`

Holds everything else: brand name, tagline, description, contact details, address,
social links, FSSAI certification, business hours, WhatsApp message templates, and
retention/promo copy. The Site Editor tab in `/admin` covers every field through forms
grouped into Brand & Contact, FSSAI Certification, Business Hours, and Customer
Retention sections — see `components/admin/SiteEditor.tsx` for the exact field list.

Key sections:

- `fssai` — licence number, issue/expiry dates, certificate image. Surfaced on
  `/trust`, in the footer, and in `LocalBusiness` JSON-LD structured data.
- `businessHours` — one entry per day (`day`, `open`, `close`, `closed`), used on the
  Contact page and in `OpeningHoursSpecification` structured data.
- `messages` — WhatsApp templates; see [WHATSAPP.md](./WHATSAPP.md).
- `retention` — `promoText` / `promoLink` shown in promo banners.

## Orders log

`data/orders.json` is an append-only log written by `/api/content/orders` whenever a
customer taps checkout. It's read-only from the admin side (Orders tab) — there's no
editor for it, only a CSV export.
