# Progressive Web App

The site installs as a PWA (Add to Home Screen) and works offline for previously
visited pages.

## Manifest

`app/manifest.ts` generates `/manifest.webmanifest` from `data/site.json` (name, theme
color, icons) plus static PWA metadata:

- `categories: ["food", "shopping", "lifestyle"]`
- `shortcuts` — long-press/right-click app icon shortcuts to `/menu` ("View Menu") and
  `/contact` ("Order on WhatsApp"), each with an icon reference.

## Service worker (`public/sw.js`)

Strategy: **stale-while-revalidate** for same-origin GET requests, with an offline
fallback for navigations.

- `install` — precaches `PRECACHE_URLS` (`/`, `/menu`, `/contact`,
  `/manifest.webmanifest`, `/offline.html`) into `CACHE_NAME`.
- `activate` — deletes any cache whose name isn't the current `CACHE_NAME`, so old
  versions don't linger.
- `fetch`:
  - Ignores non-GET requests, cross-origin requests, and anything under `/api/`
    (API responses are never cached — they must always hit the network).
  - For everything else: serve the cached response immediately if present, while a
    network request runs in the background to refresh the cache for next time
    (stale-while-revalidate).
  - If there's no cache match **and** the network fails, falls back to
    `/offline.html` for navigation requests (`event.request.mode === "navigate"`);
    other request types just fail.

## Bumping the cache version

Whenever you change `PRECACHE_URLS`, the offline page, or want to force clients to drop
stale cached assets, increment the version suffix in `CACHE_NAME`:

```js
const CACHE_NAME = "mummas-menu-v2"; // bump to v3, v4, ...
```

The next `activate` event on each client will delete the old cache automatically.

## Offline page

`public/offline.html` is a standalone, dependency-free HTML file (inline CSS, no
external assets) so it always renders even with zero network/cache access. It shows a
"You're offline" message and a "Try Again" link back to `/`.

## Install prompt

`components/ui/InstallPrompt.tsx` listens for the browser's `beforeinstallprompt`
event and shows a custom "Install app" banner; dismissal is remembered in
`localStorage` so it doesn't reappear every visit.

## Testing locally

PWA features (install prompt, service worker registration) require HTTPS or
`localhost`. Run `npm run build && npm run start`, then in Chrome DevTools → Application
tab, check Service Workers and Manifest. Use Lighthouse's PWA audit to verify
installability.
