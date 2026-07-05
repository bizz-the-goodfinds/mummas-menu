/**
 * Shared backup/restore core — used by scripts/backup.mjs, scripts/restore.mjs
 * and the admin API (app/api/admin/backups). Plain ESM so both Node scripts
 * and the Next.js server can import it.
 *
 * Format: "MMBK1" magic + 12-byte IV + 16-byte GCM tag + AES-256-GCM
 * ciphertext of gzipped JSON. Payload version 2 adds the normalized
 * categories/menu_items tables; restore accepts both v1 and v2.
 */
import { createClient } from "@supabase/supabase-js";
import { gzipSync, gunzipSync } from "zlib";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const MAGIC = "MMBK1";
export const BACKUPS_BUCKET = "backups";
const IMAGES_BUCKET = "images";

function client(supabaseUrl, secretKey) {
  return createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
}

export function assertKey(encryptionKey) {
  if (!/^[0-9a-f]{64}$/i.test(encryptionKey ?? "")) {
    throw new Error("BACKUP_ENCRYPTION_KEY must be 64 hex chars (openssl rand -hex 32)");
  }
}

async function listAllFiles(supabase, bucket, prefix = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw new Error(`storage list ${prefix || "/"}: ${error.message}`);
  const files = [];
  for (const entry of data) {
    const full = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) files.push(...(await listAllFiles(supabase, bucket, full)));
    else files.push(full);
  }
  return files;
}

async function fetchTable(supabase, table, orderCol) {
  let q = supabase.from(table).select("*");
  if (orderCol) q = q.order(orderCol, { ascending: true });
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

/** Dump everything, gzip + encrypt. Returns { buffer, meta }. */
export async function createBackupBuffer({ supabaseUrl, secretKey, encryptionKey, withImages }) {
  assertKey(encryptionKey);
  const supabase = client(supabaseUrl, secretKey);

  const [siteContent, orders, categories, menuItems] = await Promise.all([
    fetchTable(supabase, "site_content"),
    fetchTable(supabase, "orders", "created_at"),
    fetchTable(supabase, "categories", "sort_order"),
    fetchTable(supabase, "menu_items", "sort_order"),
  ]);

  const { data: userList, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) throw new Error(`auth users: ${usersErr.message}`);
  const users = userList.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.app_metadata?.role ?? null,
    created_at: u.created_at,
  }));

  const storageFiles = await listAllFiles(supabase, IMAGES_BUCKET);
  const images = [];
  if (withImages) {
    for (const file of storageFiles) {
      const { data, error } = await supabase.storage.from(IMAGES_BUCKET).download(file);
      if (error) throw new Error(`download ${file}: ${error.message}`);
      images.push({ path: file, base64: Buffer.from(await data.arrayBuffer()).toString("base64") });
    }
  }

  const backup = {
    version: 2,
    createdAt: new Date().toISOString(),
    supabaseUrl,
    tables: { site_content: siteContent, orders, categories, menu_items: menuItems },
    authUsers: users, // reference only — passwords can't be exported
    storage: { bucket: IMAGES_BUCKET, files: storageFiles, images },
  };

  const plaintext = gzipSync(Buffer.from(JSON.stringify(backup)));
  const key = Buffer.from(encryptionKey, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const buffer = Buffer.concat([Buffer.from(MAGIC), iv, cipher.getAuthTag(), encrypted]);

  return {
    buffer,
    meta: {
      createdAt: backup.createdAt,
      bytes: buffer.length,
      contentRows: siteContent.length,
      orders: orders.length,
      categories: categories.length,
      items: menuItems.length,
      users: users.length,
      storageFiles: storageFiles.length,
      imagesEmbedded: images.length,
    },
  };
}

/** Decrypt + parse a backup buffer (throws on wrong key / corrupt file). */
export function decryptBackup(raw, encryptionKey) {
  assertKey(encryptionKey);
  if (raw.subarray(0, 5).toString() !== MAGIC) {
    throw new Error("Not a Mumma's Menu backup file (bad magic header)");
  }
  const iv = raw.subarray(5, 17);
  const tag = raw.subarray(17, 33);
  const ciphertext = raw.subarray(33);
  try {
    const decipher = createDecipheriv("aes-256-gcm", Buffer.from(encryptionKey, "hex"), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(
      gunzipSync(Buffer.concat([decipher.update(ciphertext), decipher.final()])).toString(),
    );
  } catch {
    throw new Error("Decryption failed — wrong BACKUP_ENCRYPTION_KEY or corrupt file");
  }
}

/** Upsert a backup's tables (and any embedded images) back into Supabase. */
export async function restoreFromBackup(backup, { supabaseUrl, secretKey }) {
  const supabase = client(supabaseUrl, secretKey);
  const summary = [];

  const upsert = async (table, rows, conflict) => {
    if (!rows?.length) return;
    const { error } = await supabase.from(table).upsert(rows, conflict);
    if (error) throw new Error(`${table}: ${error.message}`);
    summary.push(`${table}: ${rows.length}`);
  };

  await upsert("site_content", backup.tables.site_content);
  // v2: categories must land before items (FK)
  await upsert("categories", backup.tables.categories);
  await upsert("menu_items", backup.tables.menu_items);
  await upsert("orders", backup.tables.orders);

  const EXT_TYPES = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  for (const img of backup.storage?.images ?? []) {
    const ext = img.path.split(".").pop()?.toLowerCase();
    const { error } = await supabase.storage
      .from(backup.storage.bucket)
      .upload(img.path, Buffer.from(img.base64, "base64"), {
        contentType: EXT_TYPES[ext] ?? "application/octet-stream",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) throw new Error(`upload ${img.path}: ${error.message}`);
  }
  if (backup.storage?.images?.length) summary.push(`images: ${backup.storage.images.length}`);

  return summary;
}
