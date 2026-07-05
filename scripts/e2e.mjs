/**
 * End-to-end test of the full Supabase-backed stack (v2 schema).
 *
 *   npm run build && npm run e2e
 *
 * Boots the production server on a test port and drives the real flows:
 * public pages render from the normalized menu tables, admin auth (Supabase
 * JWT), item/category CRUD with soft delete + restore, status + visibility
 * effects on the public menu, instant cache revalidation, customer orders,
 * media uploads, and admin-triggered backups. Cleans up everything it creates.
 */
import { spawn } from "child_process";
import { createClient } from "@supabase/supabase-js";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

if (!SUPABASE_URL || !PUBLISHABLE_KEY || !SUPABASE_SECRET_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing env vars — run via "npm run e2e" so .env is loaded.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("Starting production server…");
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});
let serverOutput = "";
server.stdout.on("data", (d) => (serverOutput += d));
server.stderr.on("data", (d) => (serverOutput += d));

async function waitForServer(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not start.\n${serverOutput.slice(-2000)}`);
}

const TEST_ITEM_ID = `e2e-test-item-${Date.now()}`;

try {
  await waitForServer();
  console.log("Server up.\n");

  /* ── public site ──────────────────────────────────────────────────────── */
  console.log("Public site:");
  const site = await (await fetch(`${BASE}/api/content/site`)).json();
  check("site content returns brand", typeof site.brandName === "string" && !!site.brandName);

  const menu = await (await fetch(`${BASE}/api/content/menu`)).json();
  check("public menu has categories", Array.isArray(menu.categories) && menu.categories.length > 0);

  const publicItems = menu.categories.flatMap((c) => c.items);
  check(
    "public menu excludes hidden/deleted items",
    publicItems.every((i) => i.isVisible !== false && !i.deletedAt),
  );
  check(
    "items carry v2 fields (status + timestamps)",
    publicItems.every((i) => typeof i.status === "string" && i.createdAt),
  );

  const home = await fetch(`${BASE}/`);
  check("home page renders", home.ok && (await home.text()).includes(site.brandName));
  const firstCat = menu.categories[0];
  check("category page renders", (await fetch(`${BASE}/menu/${firstCat.slug}`)).ok);

  const webpImage = publicItems.find((i) => i.image?.endsWith(".webp"))?.image;
  check("menu images are optimized webp on storage", Boolean(webpImage));
  if (webpImage) {
    const img = await fetch(webpImage);
    check(
      "webp image publicly reachable with long cache",
      img.ok && (img.headers.get("cache-control") ?? "").includes("31536000"),
    );
  }

  const adminPage = await fetch(`${BASE}/mm-ops-admin`);
  const adminHtml = await adminPage.text();
  check("admin route serves with noindex", adminPage.ok && /noindex/.test(adminHtml));

  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check("robots.txt does not leak the admin path", !robots.includes("mm-ops"));

  /* ── auth ─────────────────────────────────────────────────────────────── */
  console.log("\nAdmin auth:");
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: PUBLISHABLE_KEY },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const token = (await authRes.json()).access_token;
  check("admin login issues access token", Boolean(token));
  const authed = { "Content-Type": "application/json", "x-admin-token": token };

  check("admin menu API rejects anonymous", (await fetch(`${BASE}/api/admin/menu`)).status === 401);
  check(
    "item create rejects bogus token",
    (
      await fetch(`${BASE}/api/admin/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": "garbage" },
        body: "{}",
      })
    ).status === 401,
  );

  const adminMenu = await (
    await fetch(`${BASE}/api/admin/menu`, { headers: { "x-admin-token": token } })
  ).json();
  check(
    "admin menu includes category ids + timestamps",
    adminMenu.categories.every((c) => c.id && c.updatedAt),
  );

  /* ── item CRUD lifecycle ──────────────────────────────────────────────── */
  console.log("\nItem CRUD lifecycle:");
  const targetCategory = adminMenu.categories.find((c) => !c.deletedAt);

  const createRes = await fetch(`${BASE}/api/admin/items`, {
    method: "POST",
    headers: authed,
    body: JSON.stringify({
      id: TEST_ITEM_ID,
      categoryId: targetCategory.id,
      name: "E2E Test Thali",
      price: 149,
      description: "Created by the automated test suite.",
      image: "",
      tags: ["new"],
      status: "available",
      isVisible: true,
    }),
  });
  check("create item → 201", createRes.status === 201);

  let publicAfter = await (await fetch(`${BASE}/api/content/menu`)).json();
  const findPublic = (m) => m.categories.flatMap((c) => c.items).find((i) => i.id === TEST_ITEM_ID);
  check("new item live on public menu immediately", Boolean(findPublic(publicAfter)));

  const catPageHtml = await (await fetch(`${BASE}/menu/${targetCategory.slug}`)).text();
  check("new item on the category page (revalidation)", catPageHtml.includes("E2E Test Thali"));

  const patchStatus = await fetch(`${BASE}/api/admin/items/${TEST_ITEM_ID}`, {
    method: "PATCH",
    headers: authed,
    body: JSON.stringify({ status: "out-of-stock", price: 159 }),
  });
  check("patch status + price → 200", patchStatus.ok);
  publicAfter = await (await fetch(`${BASE}/api/content/menu`)).json();
  const patched = findPublic(publicAfter);
  check(
    "status + price + updatedAt reflected publicly",
    patched?.status === "out-of-stock" &&
      patched?.price === 159 &&
      patched?.updatedAt > patched?.createdAt,
  );

  const hideRes = await fetch(`${BASE}/api/admin/items/${TEST_ITEM_ID}`, {
    method: "PATCH",
    headers: authed,
    body: JSON.stringify({ isVisible: false }),
  });
  publicAfter = await (await fetch(`${BASE}/api/content/menu`)).json();
  check("hidden item disappears from public menu", hideRes.ok && !findPublic(publicAfter));

  const delRes = await fetch(`${BASE}/api/admin/items/${TEST_ITEM_ID}`, {
    method: "DELETE",
    headers: { "x-admin-token": token },
  });
  const adminAfterDelete = await (
    await fetch(`${BASE}/api/admin/menu`, { headers: { "x-admin-token": token } })
  ).json();
  const deletedRow = adminAfterDelete.categories
    .flatMap((c) => c.items)
    .find((i) => i.id === TEST_ITEM_ID);
  check("soft delete keeps row with deletedAt", delRes.ok && Boolean(deletedRow?.deletedAt));

  const restoreRes = await fetch(`${BASE}/api/admin/items/${TEST_ITEM_ID}`, {
    method: "PATCH",
    headers: authed,
    body: JSON.stringify({ deletedAt: null }),
  });
  const adminAfterRestore = await (
    await fetch(`${BASE}/api/admin/menu`, { headers: { "x-admin-token": token } })
  ).json();
  const restoredRow = adminAfterRestore.categories
    .flatMap((c) => c.items)
    .find((i) => i.id === TEST_ITEM_ID);
  check("restore clears deletedAt", restoreRes.ok && restoredRow && !restoredRow.deletedAt);

  /* ── category CRUD ────────────────────────────────────────────────────── */
  console.log("\nCategory CRUD:");
  const catCreate = await fetch(`${BASE}/api/admin/categories`, {
    method: "POST",
    headers: authed,
    body: JSON.stringify({ name: `E2E Cat ${Date.now()}`, emoji: "🧪", isVisible: false }),
  });
  const catJson = await catCreate.json();
  check("create category → 201", catCreate.status === 201 && catJson.category?.id);

  const catPatch = await fetch(`${BASE}/api/admin/categories/${catJson.category.id}`, {
    method: "PATCH",
    headers: authed,
    body: JSON.stringify({ name: "E2E Cat Renamed" }),
  });
  check("rename category → 200", catPatch.ok);

  const catDelete = await fetch(`${BASE}/api/admin/categories/${catJson.category.id}`, {
    method: "DELETE",
    headers: { "x-admin-token": token },
  });
  check("soft delete category → 200", catDelete.ok);

  /* ── order flow ───────────────────────────────────────────────────────── */
  console.log("\nOrder flow:");
  const orderRes = await fetch(`${BASE}/api/content/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ id: "roti", name: "Roti", price: 15, qty: 4, emoji: "🫓" }],
      source: "E2E test",
    }),
  });
  const orderJson = await orderRes.json();
  check("customer order logged", orderRes.ok && Boolean(orderJson.id));
  const ordersLog = await (
    await fetch(`${BASE}/api/content/orders`, { headers: { "x-admin-token": token } })
  ).json();
  check(
    "order visible to admin",
    ordersLog.orders.some((o) => o.id === orderJson.id),
  );

  /* ── media upload ─────────────────────────────────────────────────────── */
  console.log("\nMedia upload:");
  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("file", new File([pngBytes], "e2e-test.png", { type: "image/png" }));
  const uploadRes = await fetch(`${BASE}/api/content/media`, {
    method: "POST",
    headers: { "x-admin-token": token },
    body: form,
  });
  const uploadJson = await uploadRes.json();
  check(
    "upload returns storage URL",
    uploadRes.ok && String(uploadJson.path).includes("/storage/v1/object/public/"),
  );
  let uploadedStoragePath = null;
  if (uploadRes.ok) {
    check("uploaded file reachable", (await fetch(uploadJson.path)).ok);
    uploadedStoragePath = uploadJson.path.split("/storage/v1/object/public/images/")[1];
  }

  /* ── backups via admin API ────────────────────────────────────────────── */
  console.log("\nBackups:");
  const backupRes = await fetch(`${BASE}/api/admin/backups`, {
    method: "POST",
    headers: { "x-admin-token": token },
  });
  const backupJson = await backupRes.json();
  check("admin-triggered backup created", backupRes.ok && Boolean(backupJson.filename));

  const backupList = await (
    await fetch(`${BASE}/api/admin/backups`, { headers: { "x-admin-token": token } })
  ).json();
  const listed = backupList.backups?.find((b) => b.name === backupJson.filename);
  check("backup listed with download link", Boolean(listed?.downloadUrl));
  if (listed?.downloadUrl) {
    const dl = await fetch(listed.downloadUrl);
    const body = Buffer.from(await dl.arrayBuffer());
    check(
      "backup downloads and is encrypted (MMBK1)",
      dl.ok && body.subarray(0, 5).toString() === "MMBK1",
    );
  }

  /* ── cleanup ──────────────────────────────────────────────────────────── */
  console.log("\nCleanup:");
  const cleanups = await Promise.all([
    supabaseAdmin.from("menu_items").delete().eq("id", TEST_ITEM_ID),
    supabaseAdmin.from("categories").delete().eq("id", catJson.category.id),
    supabaseAdmin.from("orders").delete().eq("id", orderJson.id),
    uploadedStoragePath
      ? supabaseAdmin.storage.from("images").remove([uploadedStoragePath])
      : Promise.resolve({ error: null }),
    backupJson.filename
      ? supabaseAdmin.storage.from("backups").remove([backupJson.filename])
      : Promise.resolve({ error: null }),
  ]);
  check(
    "all test data cleaned up",
    cleanups.every((r) => !r.error),
  );
} catch (e) {
  failed++;
  console.error("\nE2E crashed:", e.message);
} finally {
  server.kill("SIGTERM");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
