# WhatsApp Messaging

All customer-facing WhatsApp messages are built from templates in
`data/site.json`'s `messages` object (see `lib/whatsapp.ts`), so wording can be
changed without touching code.

## Templates

| Field (`site.messages.*`) | Used by                                  | Purpose                                    |
| ------------------------- | ---------------------------------------- | ------------------------------------------ |
| `orderPrefix`             | `buildOrderMessage()`                    | Text before the itemized order list        |
| `orderSuffix`             | `buildOrderMessage()`                    | Text after the total (confirmation prompt) |
| `generalInquiry`          | `buildGeneralMessage()`                  | Floating WhatsApp button, empty-cart state |
| `supportComplaint`        | `buildSupportMessage(site, "complaint")` | Contact page "Complaint" button            |
| `supportTrack`            | `buildSupportMessage(site, "track")`     | Contact page "Track Order" button          |
| `supportFeedback`         | `buildSupportMessage(site, "feedback")`  | Contact page "Feedback" button             |

Each function falls back to a sensible default if the corresponding field is empty, so
the site never breaks if a template is blank — but for a real deployment, fill all six
in for an on-brand experience.

## How the order message is assembled

`buildOrderMessage(site, lines)` (in `lib/whatsapp.ts`):

```
<orderPrefix>
1. Item A × 2 = ₹240
2. Item B × 1 = ₹150

*Total: ₹390*<orderSuffix>
```

The order source (`site.orderSource`, falling back to `site.siteUrl`) is expected to be
referenced inside `orderSuffix` (e.g. `"...\n_(Ordered via {orderSource})_"`) so every
order is attributable back to the website when read in WhatsApp Business.

## Customizing

- **Via admin panel**: `/admin` → Messages tab. Each field has inline help text and a
  live green-bubble preview of the rendered message (using sample cart items for the
  order template), so you can see the exact result before saving.
- **Directly**: edit the `messages` object in `data/site.json`.

## WhatsApp number

`site.whatsappNumber` must be digits only, with country code, no `+` or spaces (e.g.
`91XXXXXXXXXX`). It feeds `whatsappLink()`, which builds the `https://wa.me/<number>?text=...`
deep link used by every "Order on WhatsApp" / support button across the site.
