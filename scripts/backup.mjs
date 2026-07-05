/**
 * Encrypted Supabase backup (CLI).
 *
 *   npm run backup                    → data only, saved to backups/
 *   npm run backup -- --with-images   → also embeds every storage image
 *   npm run backup -- --to-storage    → additionally uploads the encrypted
 *                                       file to the private "backups" bucket
 *
 * Output: backups/backup-<timestamp>.mmbk — gzip + AES-256-GCM, encrypted
 * with BACKUP_ENCRYPTION_KEY from .env. The repo is public, so backups are
 * ONLY safe to commit because they are encrypted.
 * Restore with:  npm run restore -- backups/<file>
 */
import { promises as fs } from "fs";
import path from "path";
import { createBackupBuffer, BACKUPS_BUCKET } from "./lib/backup-core.mjs";
import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  BACKUP_ENCRYPTION_KEY,
} = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !BACKUP_ENCRYPTION_KEY) {
  console.error('Missing env vars — run via "npm run backup" so .env is loaded.');
  process.exit(1);
}

const withImages = process.argv.includes("--with-images");
const toStorage = process.argv.includes("--to-storage");

console.log(`Backing up ${SUPABASE_URL} ${withImages ? "(with images)" : "(data only)"}…`);

const { buffer, meta } = await createBackupBuffer({
  supabaseUrl: SUPABASE_URL,
  secretKey: SUPABASE_SECRET_KEY,
  encryptionKey: BACKUP_ENCRYPTION_KEY,
  withImages,
});

const stamp = meta.createdAt.replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const filename = `backup-${stamp}.mmbk`;
const outDir = path.join(process.cwd(), "backups");
await fs.mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, filename);
await fs.writeFile(outPath, buffer);

if (toStorage) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.storage.from(BACKUPS_BUCKET).upload(filename, buffer, {
    contentType: "application/octet-stream",
  });
  if (error) console.error(`  ⚠ storage upload failed: ${error.message}`);
  else console.log(`  ↑ uploaded to storage bucket "${BACKUPS_BUCKET}"`);
}

console.log(
  `\n✓ backups/${filename} (${(buffer.length / 1024).toFixed(1)} KB)` +
    `\n  ${meta.contentRows} content rows · ${meta.categories} categories · ${meta.items} items · ` +
    `${meta.orders} orders · ${meta.users} users · ` +
    `${withImages ? `${meta.imagesEmbedded} images embedded` : `${meta.storageFiles} storage files listed (not embedded — use --with-images)`}` +
    `\n\nCommit it with:  git add backups && git commit -m "chore: db backup ${stamp}"`,
);
