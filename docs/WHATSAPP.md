# WhatsApp Messaging

All customer-facing WhatsApp messages are built from templates in `data/messages.json`
(see `lib/whatsapp.ts`), so wording can be changed without touching code.

---

## Template variables

Templates support two placeholder variables that are replaced at runtime:

| Variable        | Replaced with                                                                               |
| --------------- | ------------------------------------------------------------------------------------------- |
| `{{brandName}}` | The value of `brandName` from `data/site.json` (e.g. "Mumma's Menu")                        |
| `{{siteUrl}}`   | The resolved canonical URL — `SITE_URL` env var → `VERCEL_URL` → `data/site.json` `siteUrl` |

Example template:

```
Hi {{brandName}}! 👋 I'd like to know more.\n\n_(via {{siteUrl}})_
```

Rendered as:

```
Hi Mumma's Menu! 👋 I'd like to know more.

_(via https://mummas-menu.vercel.app)_
```

---

## Templates (`data/messages.json`)

| Field              | Used by                                  | Purpose                                    |
| ------------------ | ---------------------------------------- | ------------------------------------------ |
| `orderPrefix`      | `buildOrderMessage()`                    | Text before the itemised order list        |
| `orderSuffix`      | `buildOrderMessage()`                    | Text after the total (confirmation prompt) |
| `generalInquiry`   | `buildGeneralMessage()`                  | Floating WhatsApp button, empty-cart state |
| `supportComplaint` | `buildSupportMessage(site, "complaint")` | Contact page "Complaint" button            |
| `supportTrack`     | `buildSupportMessage(site, "track")`     | Contact page "Track Order" button          |
| `supportFeedback`  | `buildSupportMessage(site, "feedback")`  | Contact page "Feedback" button             |

If `messages.json` is missing or corrupt, built-in defaults (with `{{placeholders}}`) are used so
the site never breaks.

---

## How the order message is assembled

`buildOrderMessage(site, lines)` in `lib/whatsapp.ts`:

```
<orderPrefix (interpolated)>
1. Item A × 2 = ₹240
2. Item B × 1 = ₹150

*Total: ₹390*<orderSuffix (interpolated)>
```

---

## Editing templates

**Via admin panel** (recommended): `/admin` → Messages tab.

- Each field shows a `{{variable}}` hint bar at the top.
- The live green-bubble preview resolves variables using the current browser origin,
  so you see the exact rendered message before saving.

**Directly**: edit `data/messages.json`. Changes take effect on the next request
(the server caches per request, not persistently).

---

## Site URL in messages

The `{{siteUrl}}` variable is resolved from env vars at runtime by `lib/data.ts`:

1. `SITE_URL` env var (set this on production / custom domain)
2. `VERCEL_URL` (automatically set by Vercel on every deployment)
3. `siteUrl` in `data/site.json` (local dev fallback)

This means messages always contain the correct URL for the environment they're sent from —
development, Vercel preview, and production all show different URLs automatically.

---

## WhatsApp number

`site.whatsappNumber` must be digits only, with country code, no `+` or spaces (e.g.
`91XXXXXXXXXX`). It feeds `whatsappLink()`, which builds the
`https://wa.me/<number>?text=...` deep link used by every "Order on WhatsApp" / support
button across the site.
