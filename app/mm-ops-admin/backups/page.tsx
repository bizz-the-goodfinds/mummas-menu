"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { Button, Card, PageHeader } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";

interface BackupFile {
  name: string;
  createdAt: string;
  bytes: number | null;
  downloadUrl: string | null;
}

export default function BackupsPage() {
  const api = useAdminApi();
  const [backups, setBackups] = useState<BackupFile[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    api<{ backups: BackupFile[] }>("/api/admin/backups")
      .then((r) => setBackups(r.backups))
      .catch((e) => setError(e.message));
  }, [api]);
  useEffect(load, [load]);

  async function createBackup() {
    setCreating(true);
    setError("");
    setNotice("");
    try {
      const res = await api<{ filename: string }>("/api/admin/backups", { method: "POST" });
      setNotice(`Backup created: ${res.filename}`);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Backups"
        subtitle="Encrypted snapshots of all content and orders, stored in a private Supabase bucket"
        actions={
          <Button onClick={createBackup} disabled={creating}>
            {creating ? "Creating…" : "+ Create backup now"}
          </Button>
        }
      />

      {notice && <p className="mb-3 text-[13px] font-semibold text-green-600">{notice}</p>}
      {error && <p className="text-brand-red mb-3 text-[13px]">{error}</p>}

      <Card className="mb-4 text-[13px] leading-relaxed text-neutral-600">
        <p>
          Backups are encrypted with the server&apos;s <code>BACKUP_ENCRYPTION_KEY</code> — a
          download is useless without it. To restore one, download it into the project&apos;s{" "}
          <code>backups/</code> folder and run <code>npm run restore -- backups/&lt;file&gt;</code>{" "}
          from a terminal (restore is deliberately not possible from this panel). The CLI can also
          create backups: <code>npm run backup -- --to-storage</code>.
        </p>
      </Card>

      {!backups ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : backups.length === 0 ? (
        <p className="text-[13px] text-neutral-400">No backups yet — create the first one.</p>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          {backups.map((b) => (
            <div
              key={b.name}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100/80 px-4 py-3 last:border-0"
            >
              <div>
                <p className="text-[13.5px] font-semibold">{b.name}</p>
                <p className="text-[12px] text-neutral-500">
                  {b.createdAt ? new Date(b.createdAt).toLocaleString("en-IN") : ""}
                  {b.bytes ? ` · ${(b.bytes / 1024).toFixed(1)} KB` : ""}
                </p>
              </div>
              {b.downloadUrl && (
                <a href={b.downloadUrl} download={b.name}>
                  <Button variant="secondary">⬇ Download</Button>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
