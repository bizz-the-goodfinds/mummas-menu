# Editing Content

All content lives in **Supabase**:

- **Menu** — normalized tables: `categories` and `menu_items` (one row per
  dish, with `status`, `is_visible`, `sort_order`, and
  `created_at`/`updated_at`/`deleted_at` timestamps). Deletes from the admin
  panel are soft — rows get `deleted_at` stamped and can be restored.
- **Site info, WhatsApp messages & SEO settings** — the `site_content` table,
  one JSONB row per key (`site`, `messages`, `seo`).

The JSON files under `data/` are **seed data only**, consumed by
`npm run migrate`; the running site never reads them.

You can edit content two ways:

1. **Admin panel** at `/mm-ops-admin` (see [ADDING-CONTENT.md](./ADDING-CONTENT.md)) —
   full CRUD with live previews. Saves go live immediately.
2. **Directly in Supabase** — edit the tables in the dashboard (Table
   Editor). Changes appear on the site within 5 minutes (cache TTL).

## `menu` content (seed: `data/menu.json`)

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
          "description": "Char-grilled cottage cheese, smoky masala.",
          "image": "https://images.unsplash.com/photo-...",
          "tags": ["bestseller"],
          "isVisible": true,
          "status": "available"
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
- `isVisible` (defaults to `true`) hides the item from customers entirely when
  `false` — it disappears from the full menu, category pages, homepage featured
  section, and Hero floating cards without being deleted.
- `status` is one of `available` (default), `coming-soon`, `out-of-stock`, or
  `festive-special`. Non-`available` statuses render a badge on the card;
  `coming-soon` and `out-of-stock` also disable the Add button so the item is
  visible but not orderable.
- There is no per-item veg field — the whole kitchen is pure veg, so every item shows the
  same static VEG badge (`components/ui/Badge.tsx`).

### Images

`image` accepts any of:

- A **Supabase Storage URL** — what the admin Media tab produces, and what
  `npm run migrate` rewrites the seed images to. Stored in the public
  `images` bucket; works everywhere including Vercel.
- An **external URL** (e.g. Unsplash, Pexels, your own CDN).
- A **local path** under `/images/...` (served from `public/`) — fine for
  assets that ship with the app (logo, OG image).

Any new external image domain must be added to `images.remotePatterns` in
`next.config.ts`, or Next's image optimizer will reject it (the Supabase
storage host is already allowed).

The admin Media tab uploads straight to Supabase Storage and returns the
public URL to paste into the `image` field — this works on Vercel.

## `site` content (seed: `data/site.json`)

Holds everything else: brand name, tagline, description, contact details, address,
social links, FSSAI certification, business hours, WhatsApp message templates, and
retention/promo copy. The Site Editor tab in `/admin` covers every field through forms
grouped into Brand & Contact, FSSAI Certification, Business Hours, and Customer
Retention sections — see `components/admin/SiteEditor.tsx` for the exact field list.

Key sections:

- `fssai` — licence number, issue/expiry dates, certificate image. Surfaced in
  the footer and in `LocalBusiness` JSON-LD structured data.
- `businessHours` — one entry per day (`day`, `open`, `close`, `closed`), used on the
  Contact page and in `OpeningHoursSpecification` structured data.
- `messages` — WhatsApp templates; see [WHATSAPP.md](./WHATSAPP.md).
- `retention` — `promoText` / `promoLink` shown in promo banners.

## Orders log

The `orders` table in Supabase is an append-only log written by
`/api/content/orders` whenever a customer taps checkout (columns: `id`,
`created_at`, `items` jsonb, `total`, `source`). It's read-only from the
admin side (Orders tab) — there's no editor for it, only a CSV export.
