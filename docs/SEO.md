# SEO · AEO · GEO

How the site is optimized for classic search (SEO), answer boxes (AEO), and
AI assistants (GEO) — and how to verify it's being indexed.

## What's implemented

### SEO (Google/Bing ranking)

- Unique title/description/canonical per page; `metadataBase` and OG/Twitter
  cards everywhere. Child pages use `title.absolute` so the brand is not
  doubled (`Full Menu — Mumma's Menu | Mumma's Menu`).
- Home H1 and category/menu/contact headings include **Vadodara** and
  homestyle/tiffin language.
- Footer category links point at indexable `/menu/<slug>` pages (not
  `?category=` query URLs).
- **Admin-editable overrides** — Admin → SEO & AI: meta title, meta
  description, extra keywords, with a live Google-result preview. Blank
  fields fall back to the Vadodara-focused defaults in `DEFAULT_SEO`.
- Structured data (JSON-LD):
  - `Restaurant`/`LocalBusiness` + `WebSite` (root layout) — 24-hour opening
    hours, closed days omitted, FSSAI identifier, city `areaServed`
  - full **`Menu` → `MenuSection` → `MenuItem`** with INR prices and live
    in-stock/out-of-stock availability (`/menu`)
  - `ItemList` + `BreadcrumbList` per category page
  - `FAQPage` on the home page (fed from the FAQs in Site Content)
  - On-site testimonials stay visible on the page but are **not** marked up
    as `aggregateRating` / `Review` (Google rejects self-published review
    stars). Real stars come from Google Business Profile reviews.
- `sitemap.xml` revalidates every 5 minutes so new categories appear without
  a redeploy. `robots.txt` allows Google and the major AI crawlers.
- Search Console HTML-file verification is shipped at
  `/googleb9d6937daca980c2.html` (source: `public/googleb9d6937daca980c2.html`).
  Do not rename or edit that file.
- Fast pages: webp images with 1-year caching, static prerendering with
  5-minute revalidation.

### AEO (featured snippets / answer boxes)

- The home-page FAQ section is marked up as `FAQPage` — keep the FAQs in
  **Admin → Site Content** current; they're the main answer-box source.
- Category pages lead with a crawlable plain-text summary of items.

### GEO (ChatGPT, Claude, Gemini, Perplexity…)

- **`/llms.txt`** — a live plain-text feed of the whole business (summary,
  contact, hours, full menu with prices, FAQs) that AI crawlers read.
  The opening paragraph is editable in Admin → SEO & AI ("AI summary").
- `robots.txt` explicitly allows the major AI crawlers (GPTBot, ClaudeBot,
  Google-Extended, PerplexityBot, …).
- **`/ask-ai`** page — customers open ChatGPT/Claude/Gemini pre-loaded with a
  prompt pointing at `/llms.txt`, so answers use live data.

### What's deliberately NOT indexed

The admin panel (`/mm-ops-admin`) is triple-protected from indexing:
`noindex,nofollow` metadata, an `X-Robots-Tag: noindex` response header, and
it is never linked or listed in the sitemap. It is intentionally **absent**
from robots.txt (a disallow line would advertise the URL). `/api/*` is
disallowed for all crawlers. The 404 page is `noindex`.

## What you do after a deploy (Google account)

The admin **SEO & AI** page cannot click Verify or submit a sitemap — that
happens in your Google account.

1. Confirm the verification file is live:
   `https://mummas-menu.vercel.app/googleb9d6937daca980c2.html`
   must show `google-site-verification: googleb9d6937daca980c2.html`.
2. [Google Search Console](https://search.google.com/search-console) →
   **Verify** the URL-prefix property `https://mummas-menu.vercel.app`.
3. **Sitemaps** → submit `sitemap.xml` (not the full URL — just the filename).
4. **URL Inspection** (top bar) → inspect `/` → **Request indexing**. Repeat
   for `/menu`.
5. Optional: [Bing Webmaster Tools](https://www.bing.com/webmasters) → import
   the Search Console property (also helps ChatGPT browsing).

First pages usually appear in 2–14 days. Public check:
`site:mummas-menu.vercel.app`.

Alternative verification (only if Google asks for an HTML _tag_): copy the
`content="…"` value into **Admin → SEO & AI → Google Search Console
verification** and save. The HTML file method is already in place, so leave
that field blank.

## Quick checks (any time)

- Visit `/robots.txt`, `/sitemap.xml`, and `/llms.txt`.
- [Rich Results Test](https://search.google.com/test/rich-results) — paste
  the home page and `/menu`.
- `curl -I https://your-domain.com/mm-ops-admin` should show
  `X-Robots-Tag: noindex, nofollow, noarchive`.
- Ask ChatGPT/Perplexity "What is Mumma's Menu in Vadodara?" once crawled.

## Ranking-well checklist (ongoing)

- Keep FAQs, menu, and testimonials fresh (all admin-editable — every save
  updates the live pages, sitemap, structured data, and llms.txt together).
- Set `SITE_URL` to the final custom domain and use it consistently.
- Get the Google Business Profile listing to link to the site — for a local
  kitchen, GBP + reviews move rankings more than anything on-page.
- Share category links (e.g. `/menu/rotis-parathas`, `/menu/farali`) on
  Instagram/WhatsApp — real inbound clicks and links are the strongest signal.
- Fill the kitchen street address in **Site Content** when you can publish it
  (or keep the listing as a service-area business on GBP).
