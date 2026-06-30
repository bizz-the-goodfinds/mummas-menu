"use client";

import { useState } from "react";

export function MediaTab({ token }: { token: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<string[]>([]);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/content/media", {
        method: "POST",
        headers: { "x-admin-token": token },
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
      if (res.ok && data.path) {
        setUploaded((prev) => [data.path!, ...prev]);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed — check your connection");
    } finally {
      setUploading(false);
    }
  }

  function copyPath(p: string) {
    navigator.clipboard?.writeText(p).catch(() => {});
  }

  return (
    <div className="glass flex max-w-2xl flex-col gap-4 rounded-2xl p-6">
      <div>
        <h2 className="font-heading mb-1 text-lg font-bold">Media Library</h2>
        <p className="text-sm text-neutral-600">
          Upload a food photo or certificate image, then copy the resulting path into the Menu or
          Site Info editors. On serverless hosts (e.g. Vercel) local upload isn&apos;t supported —
          paste an external image URL instead.
        </p>
      </div>

      <label className="glass-strong hover:border-brand-red/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-600">
        <span className="text-3xl" aria-hidden>
          📷
        </span>
        {uploading ? "Uploading…" : "Click to choose an image (JPEG, PNG, WebP — max 4MB)"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>

      {error && <p className="text-brand-red text-sm">{error}</p>}

      {uploaded.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Recently uploaded</h3>
          {uploaded.map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 text-sm"
            >
              <code className="flex-1 truncate">{p}</code>
              <button
                onClick={() => copyPath(p)}
                className="text-brand-red shrink-0 font-semibold"
                type="button"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
