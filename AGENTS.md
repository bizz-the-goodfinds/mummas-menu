<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Keep Docs, Events & Env in Sync

After **any** code change — however small — check and update all of the following that are affected before considering the task done:

## 1. Analytics events (`lib/analytics.ts` + `README.md`)

- Adding a new user interaction? Add a `track*` function in `lib/analytics.ts` and call it at the interaction point.
- The analytics event table in `README.md` must match the functions in `lib/analytics.ts` exactly. Update it whenever events are added, renamed, or removed.

## 2. Environment variables (`.env.example` + `README.md`)

- Adding a new env var? Add it to `.env.example` with a blank value and a one-line comment explaining where to get it.
- Update the environment variable table in `README.md` to include it.
- Never put real secrets in `.env.example` or `README.md`.

## 3. `docs/` files

- `docs/CONTENT.md` — update if the shape of `data/menu.json` or `data/site.json` changes (new fields, renamed keys, removed fields).
- `docs/SETUP.md` — update if setup steps, Node version, or scripts change.
- `docs/ADDING-CONTENT.md` — update if the admin portal gains new tabs/fields, or if the JSON structure for menu items or categories changes.
- Other docs in `docs/` — update if their subject changes.

## 4. `README.md`

- Project structure section must reflect any new top-level files or directories.
- Scripts table must reflect any changes to `package.json` scripts.

## Checklist to run mentally before every response

- [ ] Did I add/remove/rename a tracked event? → update `lib/analytics.ts` and the README table.
- [ ] Did I add/change an env var? → update `.env.example` and the README table.
- [ ] Did I change the menu/site JSON shape? → update `docs/CONTENT.md` and `docs/ADDING-CONTENT.md`.
- [ ] Did I add a new file or directory at the top level? → update the README structure section.
- [ ] Did I change how the admin portal works? → update `docs/ADDING-CONTENT.md`.
