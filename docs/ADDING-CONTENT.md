# Adding & Editing Menu Content

This guide is for anyone who wants to update the website without touching any code.  
No technical knowledge needed. Just a web browser.

---

## Before you start

1. Open the website in your browser.
2. Go to the **Admin page**: the address is private (not linked from the
   website, so search engines can't find it) — ask Dip for the exact link and
   bookmark it.
3. Type the admin **email and password** and press **Enter**.
   (You stay logged in on that device until you log out.)

You are now inside the admin panel. The menu on the left (or the chips on top,
on a phone) has: **Dashboard**, **Menu Items**, **Categories**, **Orders**,
**Site Content**, **SEO & AI**, **WhatsApp Messages**, **Media**, and **Backups**.

---

## Add a new menu item

A "menu item" is one dish — like "Aloo Paratha" or "Paneer Sabji + Rice".

**Steps:**

1. Click **Menu Items** in the sidebar.
2. Click **"+ New Item"** (top right).
3. Fill in the form — the card on the right shows a **live preview** of
   exactly how the dish will look on the website while you type:

   | Field           | What to type                        | Example                                                              |
   | --------------- | ----------------------------------- | -------------------------------------------------------------------- |
   | **Name**        | The dish name                       | Aloo Paratha                                                         |
   | **Price**       | Amount in rupees, numbers only      | 60                                                                   |
   | **Description** | One or two sentences about the dish | Soft homestyle paratha stuffed with spiced aloo, served with pickle. |
   | **Image URL**   | Web link to a photo (see below)     | https://...                                                          |
   | **Tags**        | Optional labels (see below)         | bestseller                                                           |

4. Choose the **Category** and a **Status** (see below), keep "Visible on the
   website" on, and click **Create item**.

The dish appears on the website immediately.

### Item status

| Status              | What customers see                     |
| ------------------- | -------------------------------------- |
| **Available**       | Normal — can be ordered                |
| **Coming Soon**     | Badge on the card, Add button disabled |
| **Out of Stock**    | Badge on the card, Add button disabled |
| **Festive Special** | Golden badge — can be ordered          |

---

## Add a photo for a dish

The easiest way is to use a free image from the internet:

1. Go to [Unsplash](https://unsplash.com) or [Pexels](https://pexels.com).
2. Search for the dish name (e.g. "aloo paratha").
3. Click the photo you like → right-click on it → **Copy image address** (or "Copy image link").
4. Paste that link into the **Image URL** field in the admin form.

If you have your own photo:

The easiest way: while adding or editing a dish, click **Upload** next to the
Image field and pick a photo — it's stored in the cloud (Supabase) and the
link fills in automatically.

You can also upload from the **Media** page in the sidebar and copy the link
from there.

---

## Edit an existing dish (change name, price, description)

1. Click **Menu Items** in the sidebar.
2. Find the dish — use the search box, or filter by category/status.
3. Click the row to open the edit page.
4. Change whatever you need (the live preview updates as you type).
5. Click **Save changes**.

---

## Remove a dish

1. Click **Menu Items**, then click the dish to open it.
2. Click **Delete** (top right) and confirm.

Deleted dishes go to the **recycle bin** (tick "Recycle bin" above the items
table to see them) — open one and click **Restore** to bring it back.

---

## Hide a dish without deleting it (out of stock / seasonal)

If a dish is temporarily unavailable (ran out of an ingredient, only served on
certain occasions, etc.), you don't have to delete it — just hide it.

You have two options:

- **Out of stock but still listed**: open the dish and set **Status** to
  "Out of Stock" (or "Coming Soon"). Customers see it with a badge but can't
  order it.
- **Completely hidden**: open the dish and switch off **Visible on the
  website**. It disappears from the site entirely.

The dish disappears from the website immediately, but stays saved in the admin
so you can bring it back later by re-checking the box and saving again.

---

## Add a new category

A "category" is a group of dishes — like "Tiffin Meals", "Parathas", "Combos".

**Steps:**

1. Click **Categories** in the sidebar.
2. Click **"+ New Category"**.
3. Fill in the form (the preview shows the filter pill as it will appear):

   | Field     | What to type                           | Example      |
   | --------- | -------------------------------------- | ------------ |
   | **Name**  | The category title shown on the menu   | Farali Items |
   | **Emoji** | One emoji that represents the category | 🥗           |

4. Click **Create category**.

The new category appears on the website. You can now add dishes to it using the steps above.

---

## Change the order of categories

Open a category and change its **Sort order** number — lower numbers appear
first on the website.

---

## Mark a dish as a "Bestseller" or "New"

These show a small badge on the dish card on the website.

1. Open the dish from **Menu Items**.
2. In the **Tags** field, type `bestseller` or `new` (all lowercase,
   comma-separated if more than one).
3. Click **Save changes**.

To remove the badge, clear the tag and save.

---

## Tags reference

| Tag          | What it does                                            |
| ------------ | ------------------------------------------------------- |
| `bestseller` | Shows a gold "Bestseller" badge                         |
| `new`        | Shows a green "New" badge                               |
| `most-loved` | Same as bestseller (shows on homepage featured section) |

Any other tag you type will still appear as a plain label on the dish.

---

## Update business hours or contact info

1. Click **Site Content** in the sidebar.
2. Find the **Business Hours** section — change open and close times for each day.
3. Find the **Brand & Contact** section — update phone number, address, WhatsApp number.
4. Click **Save** at the bottom of the section.

---

## Manage photos (Media page)

The **Media** page shows every photo stored in the cloud. You can search,
upload new ones, copy a photo's link (to paste into a dish), and delete
photos you no longer need. Careful: deleting a photo that a dish still uses
leaves that dish without a picture.

---

## Help Google and AI find us (SEO & AI page)

The **SEO & AI** page controls how the website appears on Google and how AI
apps like ChatGPT describe us. The preview box shows exactly how the Google
result will look. If unsure, leave fields blank — Vadodara-focused defaults
are used.

**You do not need to paste a Google verification code here.** Ownership uses
the HTML file already on the site. After a deploy, finish these steps in
your Google account (also listed at the top of the SEO & AI page):

1. [Search Console](https://search.google.com/search-console) → **Verify**.
2. **Sitemaps** → submit `sitemap.xml`.
3. **URL Inspection** → request indexing for the homepage and `/menu`.

See [SEO.md](./SEO.md) for the full guide.

---

## Take a backup

Click **Backups** in the sidebar, then **"+ Create backup now"**. A snapshot
of the whole menu, site content, and orders is saved safely (encrypted) in the
cloud. Do this before making big changes. If something goes wrong, contact
Dip — a backup can be restored.

---

## Common questions

**Q: I saved a dish but I don't see it on the website.**  
Refresh the page — changes go live immediately after saving. If it still doesn't show, check that you actually clicked Save and that the form had no red error messages.

**Q: The image is not showing.**  
The image link might be broken. Try copying the link and pasting it into a new browser tab — if you don't see the image there either, find a different photo and use that link instead.

**Q: I accidentally deleted something.**  
Contact Dip. The previous version can be recovered from a database backup.

**Q: I want to add a dish that does not fit any existing category.**  
Create a new category first (see "Add a new category" above), then add the dish to it.

---

## Need help?

Contact Dip at dipv@digiflux.io or call/WhatsApp directly.
