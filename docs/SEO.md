# SEO · AEO · GEO

How the site is optimized for classic search (SEO), answer boxes (AEO), and
AI assistants (GEO) — and how to verify it's being indexed.

## What's implemented

### SEO (Google/Bing ranking)

- Unique title/description/canonical per page; `metadataBase` and OG/Twitter
  cards everywhere.
- **Admin-editable overrides** — Admin → SEO & AI: meta title, meta
  description, extra keywords, with a live Google-result preview.
- Structured data (JSON-LD):
  - `Restaurant`/`LocalBusiness` with address, hours, `aggregateRating` +
    reviews (root layout)
  - full **`Menu` → `MenuSection` → `MenuItem`** with INR prices and live
    in-stock/out-of-stock availability (`/menu`)
  - `ItemList` + `BreadcrumbList` per category page
  - `FAQPage` on the home page (fed from the FAQs in Site Content)
- `sitemap.xml` (all public pages + categories) and `robots.txt`.
- Fast pages: webp images (~40KB) with 1-year caching, static prerendering
  with 5-minute revalidation.

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
disallowed for all crawlers.

## How to check indexing & crawling

1. **Google Search Console** (do this once, it's the main tool):
   1. Go to [search.google.com/search-console](https://search.google.com/search-console)
      → Add property → URL prefix → enter the site URL.
   2. Choose the **HTML tag** verification method, copy only the `content="…"`
      value, paste it into **Admin → SEO & AI → Google Search Console
      verification**, save, redeploy — then click Verify in Google.
   3. Sitemaps → submit `sitemap.xml`.
   4. After a few days: **Pages** report shows what's indexed;
      **URL Inspection** (top bar) checks any single URL and offers
      "Request indexing" for new/changed pages.
2. **Quick manual checks** (any time, no setup):
   - Search `site:your-domain.com` on Google — lists every indexed page.
     The admin panel must NOT appear here.
   - Visit `/robots.txt`, `/sitemap.xml`, and `/llms.txt` in a browser.
   - [Rich Results Test](https://search.google.com/test/rich-results) — paste
     the home page and `/menu` URLs to confirm the FAQ and structured data
     are picked up.
   - `curl -I https://your-domain.com/mm-ops-admin` should show
     `X-Robots-Tag: noindex, nofollow, noarchive`.
3. **Bing** (also powers ChatGPT browsing): [Bing Webmaster
   Tools](https://www.bing.com/webmasters) can import your verified Google
   Search Console property in two clicks.
4. **AI answer check**: ask ChatGPT/Perplexity "What is Mumma's Menu in
   Vadodara?" — once crawled, answers should reflect `/llms.txt` content.

## Ranking-well checklist (ongoing)

- Keep FAQs, menu, and testimonials fresh (all admin-editable — every save
  updates the live pages, sitemap, structured data, and llms.txt together).
- Set `SITE_URL` to the final custom domain and use it consistently.
- Get the Google Business Profile listing to link to the site — for a local
  kitchen, GBP + reviews move rankings more than anything on-page.
- Share category links (e.g. `/menu/parathas`) on Instagram/WhatsApp — real
  inbound clicks and links are the strongest signal.
