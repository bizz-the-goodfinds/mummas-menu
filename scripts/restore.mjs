/**
 * Restore a backup produced by scripts/backup.mjs (or the admin panel) into
 * Supabase.
 *
 *   npm run restore -- backups/backup-20260706-113000.mmbk
 *   npm run restore -- backups/<file> --yes    (skip confirmation)
 *
 * Upserts all tables and re-uploads any images embedded in the backup.
 * Auth users are NOT restored (passwords cannot be exported) — run
 * `npm run migrate -- --only auth` afterwards if needed.
 */
import { promises as fs } from "fs";
import readline from "readline";
import { decryptBackup, restoreFromBackup } from "./lib/backup-core.mjs";

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  BACKUP_ENCRYPTION_KEY,
} = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !BACKUP_ENCRYPTION_KEY) {
  console.error('Missing env vars — run via "npm run restore" so .env is loaded.');
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--yes");
const skipConfirm = process.argv.includes("--yes");
const file = args[0];
if (!file) {
  console.error("Usage: npm run restore -- backups/<file> [--yes]");
  process.exit(1);
}

let backup;
try {
  backup = decryptBackup(await fs.readFile(file), BACKUP_ENCRYPTION_KEY);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

console.log(
  `Backup v${backup.version} from ${backup.createdAt} (${backup.supabaseUrl})\n` +
    `  ${backup.tables.site_content.length} content rows · ` +
    `${backup.tables.categories?.length ?? 0} categories · ` +
    `${backup.tables.menu_items?.length ?? 0} items · ` +
    `${backup.tables.orders.length} orders · ` +
    `${backup.storage?.images?.length ?? 0} embedded images\n` +
    `Restoring INTO ${SUPABASE_URL} — this overwrites current content.`,
);

if (!skipConfirm) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((res) => rl.question("Type 'restore' to continue: ", res));
  rl.close();
  if (answer.trim() !== "restore") {
    console.log("Aborted.");
    process.exit(0);
  }
}

const summary = await restoreFromBackup(backup, {
  supabaseUrl: SUPABASE_URL,
  secretKey: SUPABASE_SECRET_KEY,
});
for (const line of summary) console.log(`✓ ${line}`);

console.log(
  "\nRestore complete. Note: the site caches content for up to 5 minutes — " +
    "save anything in the admin portal (or redeploy) to force an immediate refresh.",
);
