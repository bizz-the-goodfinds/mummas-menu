/**
 * Modular, idempotent Supabase migration. Run everything:
 *
 *   npm run migrate
 *
 * …or only specific modules:
 *
 *   npm run migrate -- --only schema,images
 *
 * Modules (run in this order):
 *   schema      tables (site_content, orders, categories, menu_items),
 *               updated_at trigger, RLS (deny-all)
 *   buckets     public "images" bucket + private "backups" bucket
 *   auth        admin user from ADMIN_EMAIL / ADMIN_PASSWORD (create or update)
 *   content     seed site + messages jsonb rows from data/*.json (skips if present)
 *   menu-data   normalize menu into categories/menu_items tables. Source: the
 *               legacy site_content "menu" row if present, else data/menu.json.
 *               Maps isAvailability→is_visible. Skips if tables already have
 *               rows (use --force to reseed).
 *   images      optimize every referenced image (sharp → webp, max 1000px,
 *               1-year cache-control), upload to storage, update DB refs
 *   orders      copy data/orders.json into the orders table (if any)
 *   local-json  rewrite data/menu.json seed to the v2 shape (isVisible/status)
 */
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  SUPABASE_DB_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_DB_URL })) {
  if (!v) {
    console.error(`Missing env var: ${k}. Run via "npm run migrate" so .env is loaded.`);
    process.exit(1);
  }
}

const ALL_MODULES = [
  "schema",
  "buckets",
  "auth",
  "content",
  "menu-data",
  "images",
  "orders",
  "local-json",
];
const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only"));
let modules = ALL_MODULES;
if (onlyArg) {
  const list = (onlyArg.split("=")[1] ?? args[args.indexOf(onlyArg) + 1] ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const unknown = list.filter((m) => !ALL_MODULES.includes(m));
  if (unknown.length || !list.length) {
    console.error(`Unknown/empty modules: ${unknown.join(", ")}\nValid: ${ALL_MODULES.join(", ")}`);
    process.exit(1);
  }
  modules = ALL_MODULES.filter((m) => list.includes(m));
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});
const IMAGES_BUCKET = "images";
const BACKUPS_BUCKET = "backups";
const dataDir = path.join(process.cwd(), "data");
const publicDir = path.join(process.cwd(), "public");

const storageUrl = (p) => `${SUPABASE_URL}/storage/v1/object/public/${IMAGES_BUCKET}/${p}`;

/* ── schema ─────────────────────────────────────────────────────────────── */
async function moduleSchema() {
  const client = new pg.Client({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(`
      create table if not exists public.site_content (
        key text primary key,
        data jsonb not null,
        updated_at timestamptz not null default now()
      );
      create table if not exists public.orders (
        id uuid primary key,
        created_at timestamptz not null default now(),
        items jsonb not null,
        total numeric(10,2) not null,
        source text not null default 'Website'
      );
      create index if not exists orders_created_at_idx on public.orders (created_at desc);

      create table if not exists public.categories (
        id uuid primary key default gen_random_uuid(),
        slug text not null unique,
        name text not null,
        emoji text not null default '',
        sort_order int not null default 0,
        is_visible boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        deleted_at timestamptz
      );
      create table if not exists public.menu_items (
        id text primary key,
        category_id uuid not null references public.categories(id) on delete cascade,
        name text not null,
        price numeric(10,2) not null default 0,
        description text not null default '',
        image text not null default '',
        tags text[] not null default '{}',
        status text not null default 'available'
          check (status in ('available','coming-soon','out-of-stock','festive-special')),
        is_visible boolean not null default true,
        sort_order int not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        deleted_at timestamptz
      );
      create index if not exists menu_items_category_idx on public.menu_items (category_id);

      create or replace function public.touch_updated_at() returns trigger
      language plpgsql as $$
      begin
        new.updated_at = now();
        return new;
      end $$;
      drop trigger if exists categories_touch on public.categories;
      create trigger categories_touch before update on public.categories
        for each row execute function public.touch_updated_at();
      drop trigger if exists menu_items_touch on public.menu_items;
      create trigger menu_items_touch before update on public.menu_items
        for each row execute function public.touch_updated_at();
      drop trigger if exists site_content_touch on public.site_content;
      create trigger site_content_touch before update on public.site_content
        for each row execute function public.touch_updated_at();

      -- Deny-all RLS: no policies on purpose. All app access goes through the
      -- server with the secret key (which bypasses RLS); anon gets nothing.
      alter table public.site_content enable row level security;
      alter table public.orders enable row level security;
      alter table public.categories enable row level security;
      alter table public.menu_items enable row level security;
    `);
    console.log("✓ schema: tables + updated_at triggers + RLS ready");
  } finally {
    await client.end();
  }
}

/* ── buckets ────────────────────────────────────────────────────────────── */
async function moduleBuckets() {
  const results = await Promise.all([
    supabase.storage.createBucket(IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: "10MB",
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    }),
    supabase.storage.createBucket(BACKUPS_BUCKET, { public: false }),
  ]);
  for (const { error } of results) {
    if (error && !/already exists/i.test(error.message))
      throw new Error(`bucket: ${error.message}`);
  }
  console.log(`✓ storage: "${IMAGES_BUCKET}" (public) + "${BACKUPS_BUCKET}" (private) ready`);
}

/* ── auth ───────────────────────────────────────────────────────────────── */
async function moduleAuth() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD not set");
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (!error) {
    console.log(`✓ auth: admin user created (${created.user.email})`);
    return;
  }
  if (!/already.*(registered|exists)/i.test(error.message))
    throw new Error(`auth: ${error.message}`);

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw new Error(`auth list: ${listErr.message}`);
  const user = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  if (!user) throw new Error("auth: user reported as existing but not found in list");
  const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: ADMIN_PASSWORD,
    app_metadata: { role: "admin" },
  });
  if (updErr) throw new Error(`auth update: ${updErr.message}`);
  const others = list.users.filter((u) => u.id !== user.id);
  if (others.length) {
    console.log(`  ℹ other auth users exist: ${others.map((u) => u.email).join(", ")}`);
  }
  console.log(`✓ auth: admin user updated (${ADMIN_EMAIL})`);
}

/* ── content (site + messages jsonb) ────────────────────────────────────── */
async function moduleContent() {
  const { data: existing } = await supabase.from("site_content").select("key");
  const have = new Set((existing ?? []).map((r) => r.key));

  const rows = [];
  if (!have.has("site") || force) {
    const site = JSON.parse(await fs.readFile(path.join(dataDir, "site.json"), "utf-8"));
    delete site.messages;
    rows.push({ key: "site", data: site });
  }
  if (!have.has("messages") || force) {
    const messages = JSON.parse(await fs.readFile(path.join(dataDir, "messages.json"), "utf-8"));
    rows.push({ key: "messages", data: messages });
  }
  if (!rows.length) {
    console.log("✓ content: site + messages already seeded (use --force to reseed)");
    return;
  }
  const { error } = await supabase.from("site_content").upsert(rows);
  if (error) throw new Error(`content upsert: ${error.message}`);
  console.log(`✓ content: seeded ${rows.map((r) => r.key).join(", ")}`);
}

/* ── menu-data (jsonb → normalized tables) ──────────────────────────────── */
async function moduleMenuData() {
  const { count } = await supabase.from("categories").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0 && !force) {
    console.log("✓ menu-data: categories table already populated (use --force to reseed)");
    return;
  }
  if (force && (count ?? 0) > 0) {
    await supabase.from("menu_items").delete().neq("id", "");
    await supabase.from("categories").delete().neq("slug", "");
    console.log("  ⚠ --force: cleared existing categories + menu_items");
  }

  // Prefer the live legacy jsonb row (may contain admin edits newer than the
  // seed file); fall back to data/menu.json.
  let menu;
  let source;
  const { data: legacy } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", "menu")
    .maybeSingle();
  if (legacy?.data) {
    menu = legacy.data;
    source = "site_content (legacy DB row)";
  } else {
    menu = JSON.parse(await fs.readFile(path.join(dataDir, "menu.json"), "utf-8"));
    source = "data/menu.json";
  }

  let catCount = 0;
  let itemCount = 0;
  for (const [catIdx, cat] of (menu.categories ?? []).entries()) {
    const { data: catRow, error: catErr } = await supabase
      .from("categories")
      .insert({
        slug: cat.slug,
        name: cat.name,
        emoji: cat.emoji ?? "",
        sort_order: catIdx,
        is_visible: cat.isVisible !== false,
      })
      .select()
      .single();
    if (catErr) throw new Error(`category ${cat.slug}: ${catErr.message}`);
    catCount++;

    const itemRows = (cat.items ?? []).map((item, itemIdx) => ({
      id: item.id,
      category_id: catRow.id,
      name: item.name,
      price: item.price ?? 0,
      description: item.description ?? "",
      image: item.image ?? "",
      tags: item.tags ?? [],
      // v1 seeds have isAvailability; v2 seeds have isVisible + status.
      is_visible: (item.isVisible ?? item.isAvailability) !== false,
      status: item.status ?? "available",
      sort_order: itemIdx,
    }));
    if (itemRows.length) {
      const { error: itemErr } = await supabase.from("menu_items").insert(itemRows);
      if (itemErr) throw new Error(`items for ${cat.slug}: ${itemErr.message}`);
      itemCount += itemRows.length;
    }
  }

  // The legacy jsonb row is now superseded by the tables — drop it so nothing
  // reads stale data.
  await supabase.from("site_content").delete().eq("key", "menu");

  console.log(`✓ menu-data: ${catCount} categories, ${itemCount} items migrated from ${source}`);
}

/* ── images (optimize + upload + rewrite refs) ──────────────────────────── */
async function optimizeAndUpload(sourceBuffer, storagePath) {
  const webpPath = storagePath.replace(/\.(png|jpe?g|webp)$/i, "") + ".webp";
  const optimized = await sharp(sourceBuffer)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(webpPath, optimized, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`upload ${webpPath}: ${error.message}`);
  return { url: storageUrl(webpPath), bytes: optimized.length };
}

async function sourceBufferFor(imageRef) {
  // Local ref → public/…; storage URL → prefer the local original (better
  // quality source), else download from storage.
  const publicPrefix = `${SUPABASE_URL}/storage/v1/object/public/${IMAGES_BUCKET}/`;
  let relPath = null;
  if (imageRef.startsWith("/images/")) relPath = imageRef.replace(/^\/images\//, "");
  else if (imageRef.startsWith(publicPrefix)) relPath = imageRef.slice(publicPrefix.length);
  else return null; // external URL — leave untouched

  const localAbs = path.join(publicDir, "images", relPath);
  try {
    return { buffer: await fs.readFile(localAbs), relPath };
  } catch {
    const { data, error } = await supabase.storage.from(IMAGES_BUCKET).download(relPath);
    if (error) return null;
    return { buffer: Buffer.from(await data.arrayBuffer()), relPath };
  }
}

async function moduleImages() {
  const { data: items, error } = await supabase.from("menu_items").select("id, image");
  if (error) throw new Error(`load items: ${error.message}`);

  let done = 0;
  let savedBytes = 0;
  for (const item of items ?? []) {
    if (!item.image || item.image.endsWith(".webp")) continue;
    const src = await sourceBufferFor(item.image);
    if (!src) continue;
    const { url, bytes } = await optimizeAndUpload(src.buffer, src.relPath);
    const { error: updErr } = await supabase
      .from("menu_items")
      .update({ image: url })
      .eq("id", item.id);
    if (updErr) throw new Error(`update ${item.id}: ${updErr.message}`);
    savedBytes += src.buffer.length - bytes;
    done++;
    process.stdout.write(
      `  ↻ ${src.relPath} → webp (${(src.buffer.length / 1024).toFixed(0)}KB → ${(bytes / 1024).toFixed(0)}KB)\n`,
    );
  }

  // FSSAI certificate in the site document.
  const { data: siteRow } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", "site")
    .maybeSingle();
  const cert = siteRow?.data?.fssai?.certImage;
  if (cert && !cert.endsWith(".webp")) {
    const src = await sourceBufferFor(cert);
    if (src) {
      const { url } = await optimizeAndUpload(src.buffer, src.relPath);
      siteRow.data.fssai.certImage = url;
      const { error: siteErr } = await supabase
        .from("site_content")
        .update({ data: siteRow.data })
        .eq("key", "site");
      if (siteErr) throw new Error(`site cert update: ${siteErr.message}`);
      done++;
    }
  }

  console.log(
    `✓ images: ${done} optimized to webp (saved ~${(savedBytes / 1024 / 1024).toFixed(1)}MB, 1y cache-control)`,
  );
}

/* ── orders ─────────────────────────────────────────────────────────────── */
async function moduleOrders() {
  let log;
  try {
    log = JSON.parse(await fs.readFile(path.join(dataDir, "orders.json"), "utf-8"));
  } catch {
    log = { orders: [] };
  }
  if (!log.orders?.length) {
    console.log("✓ orders: no local orders to migrate");
    return;
  }
  const rows = log.orders.map((o) => ({
    id: o.id,
    created_at: o.timestamp,
    items: o.items,
    total: o.total,
    source: o.source ?? "Website",
  }));
  const { error } = await supabase.from("orders").upsert(rows, { ignoreDuplicates: true });
  if (error) throw new Error(`orders upsert: ${error.message}`);
  console.log(`✓ orders: ${rows.length} migrated`);
}

/* ── local-json (upgrade the seed file to v2 shape) ─────────────────────── */
async function moduleLocalJson() {
  const file = path.join(dataDir, "menu.json");
  const menu = JSON.parse(await fs.readFile(file, "utf-8"));
  let changed = false;
  for (const cat of menu.categories ?? []) {
    if (cat.isVisible === undefined) {
      cat.isVisible = true;
      changed = true;
    }
    for (const item of cat.items ?? []) {
      if ("isAvailability" in item) {
        item.isVisible = item.isAvailability !== false;
        delete item.isAvailability;
        changed = true;
      }
      if (item.isVisible === undefined) {
        item.isVisible = true;
        changed = true;
      }
      if (item.status === undefined) {
        item.status = "available";
        changed = true;
      }
    }
  }
  if (changed) {
    await fs.writeFile(file, JSON.stringify(menu, null, 2) + "\n", "utf-8");
    console.log("✓ local-json: data/menu.json upgraded to v2 seed shape (isVisible + status)");
  } else {
    console.log("✓ local-json: data/menu.json already v2 shape");
  }
}

/* ── run ────────────────────────────────────────────────────────────────── */
const RUNNERS = {
  schema: moduleSchema,
  buckets: moduleBuckets,
  auth: moduleAuth,
  content: moduleContent,
  "menu-data": moduleMenuData,
  images: moduleImages,
  orders: moduleOrders,
  "local-json": moduleLocalJson,
};

console.log(`Running modules: ${modules.join(", ")}${force ? " (--force)" : ""}\n`);
try {
  for (const mod of modules) {
    await RUNNERS[mod]();
  }
  console.log("\nMigration complete.");
} catch (e) {
  console.error("\nMigration failed:", e.message);
  process.exit(1);
}
