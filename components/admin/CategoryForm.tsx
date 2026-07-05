"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminApi } from "./useAdminApi";
import { Button, Card, Field, TextInput, Toggle } from "./ui";

export interface CategoryFormValues {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  sortOrder: number;
  isVisible: boolean;
}

export function CategoryForm({
  initial,
  mode,
}: {
  initial: CategoryFormValues;
  mode: "create" | "edit";
}) {
  const api = useAdminApi();
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CategoryFormValues>(key: K, v: CategoryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  };

  // Live preview of the category pill exactly as the menu page renders it
  const previewName = values.name || "Category name";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        slug: values.slug || undefined,
        name: values.name,
        emoji: values.emoji,
        sortOrder: values.sortOrder,
        isVisible: values.isVisible,
      };
      if (mode === "create") {
        await api("/api/admin/categories", { method: "POST", body: payload });
        router.push("/mm-ops-admin/categories");
        router.refresh();
      } else {
        await api(`/api/admin/categories/${values.id}`, { method: "PATCH", body: payload });
        setSaved(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Farali Items"
              required
              maxLength={64}
            />
          </Field>
          <Field label="Emoji">
            <TextInput
              value={values.emoji}
              onChange={(e) => set("emoji", e.target.value)}
              placeholder="🥗"
              maxLength={8}
            />
          </Field>
          <Field
            label="Slug"
            hint={
              mode === "create"
                ? "Leave blank to auto-generate from the name"
                : "Changing this changes the category URL"
            }
          >
            <TextInput
              value={values.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="farali-items"
              maxLength={64}
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first">
            <TextInput
              type="number"
              value={values.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
            />
          </Field>
        </div>

        <Toggle
          checked={values.isVisible}
          onChange={(v) => set("isVisible", v)}
          label="Visible on the website"
        />

        {error && <p className="text-brand-red text-[13px]">{error}</p>}

        <div className="flex items-center gap-3 border-t border-neutral-200/60 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          {saved && <span className="text-[13px] font-semibold text-green-600">Saved ✓</span>}
        </div>
      </Card>

      <div className="lg:sticky lg:top-6">
        <p className="mb-2 text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
          Live preview
        </p>
        <div className="glass rounded-2xl p-5">
          <p className="mb-3 text-[11px] text-neutral-400">Filter pill on the menu page:</p>
          <span className="bg-brand-red inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white">
            {values.emoji || "🍽️"} {previewName}
          </span>
          <p className="mt-4 mb-1 text-[11px] text-neutral-400">Category page URL:</p>
          <code className="text-[12px] text-neutral-600">
            /menu/{values.slug || "(auto from name)"}
          </code>
        </div>
      </div>
    </form>
  );
}
