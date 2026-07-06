"use client";

/**
 * Full media manager for the Supabase images bucket: browse (with folder
 * filter + search), upload, copy public URLs, and delete.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "./useAdminApi";
import { Button, ConfirmDialog, Select, TextInput } from "./ui";
import { Skeleton } from "@/components/ui/Skeleton";

interface MediaFile {
  path: string;
  url: string;
  bytes: number | null;
  createdAt: string | null;
}

export function MediaManager() {
  const api = useAdminApi();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [error, setError] = useState("");
  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<MediaFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedPath, setCopiedPath] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api<{ files: MediaFile[] }>("/api/admin/media")
      .then((r) => setFiles(r.files))
      .catch((e) => setError(e.message));
  }, [api]);
  useEffect(load, [load]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const f of files ?? []) {
      const dir = f.path.includes("/") ? f.path.split("/")[0] : "(root)";
      set.add(dir);
    }
    return [...set].sort();
  }, [files]);

  const visible = (files ?? []).filter((f) => {
    const dir = f.path.includes("/") ? f.path.split("/")[0] : "(root)";
    if (folder !== "all" && dir !== folder) return false;
    if (query && !f.path.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      await api("/api/content/media", { method: "POST", body: form });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api("/api/admin/media", { method: "DELETE", body: { path: toDelete.path } });
      setToDelete(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copyUrl(f: MediaFile) {
    void navigator.clipboard.writeText(f.url);
    setCopiedPath(f.path);
    setTimeout(() => setCopiedPath(""), 1500);
  }

  if (error && !files) return <p className="text-brand-red text-sm">{error}</p>;
  if (!files) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:max-w-[220px]">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            aria-label="Search media"
          />
        </div>
        <Select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="!w-auto"
          aria-label="Filter by folder"
        >
          <option value="all">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
        <span className="text-[12px] text-neutral-500">{visible.length} files</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <Button className="ml-auto" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : "⬆ Upload image"}
        </Button>
      </div>

      {error && <p className="text-brand-red text-[13px]">{error}</p>}

      {visible.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-neutral-400">No files match.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((f) => (
            <div key={f.path} className="glass group overflow-hidden rounded-2xl">
              <div className="bg-brand-pink relative aspect-square w-full">
                <Image
                  src={f.url}
                  alt={f.path}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1.5 p-3">
                <p className="truncate text-[12px] font-semibold" title={f.path}>
                  {f.path}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {f.bytes ? `${(f.bytes / 1024).toFixed(0)} KB` : ""}
                  {f.createdAt
                    ? ` · ${new Date(f.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                    : ""}
                </p>
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => copyUrl(f)}
                    className="glass-strong flex-1 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold"
                  >
                    {copiedPath === f.path ? "Copied ✓" : "Copy URL"}
                  </button>
                  <button
                    onClick={() => setToDelete(f)}
                    className="rounded-lg border border-red-200 bg-white px-2 py-1.5 text-[11.5px] font-semibold text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${f.path}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this file?"
        body={`"${toDelete?.path}" will be permanently removed from storage. Any dish still using this image will show a blank picture until you give it a new one.`}
        confirmLabel="Delete file"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
