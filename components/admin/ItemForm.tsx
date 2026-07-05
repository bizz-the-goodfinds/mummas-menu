"use client";

/**
 * Shared create/edit form for menu items, with a live customer-facing
 * preview: the right-hand column renders the exact ItemCard the shopper
 * will see, updating as you type.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CartProvider } from "@/lib/cart-context";
import { ItemCard } from "@/components/ui/ItemCard";
import { ITEM_STATUSES, ITEM_STATUS_LABELS } from "@/lib/types";
import type { ItemStatus, MenuCategory, MenuItem } from "@/lib/types";
import { useAdminApi } from "./useAdminApi";
import { Button, Card, Field, Select, TextArea, TextInput, Toggle } from "./ui";

export interface ItemFormValues {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  tags: string;
  status: ItemStatus;
  isVisible: boolean;
}

export function ItemForm({
  categories,
  initial,
  mode,
}: {
  categories: MenuCategory[];
  initial: ItemFormValues;
  mode: "create" | "edit";
}) {
  const api = useAdminApi();
  const router = useRouter();
  const [values, setValues] = useState<ItemFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ItemFormValues>(key: K, v: ItemFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  };

  const activeCategories = categories.filter((c) => !c.deletedAt);
  const previewCategory = activeCategories.find((c) => c.id === values.categoryId);

  const previewItem: MenuItem = {
    id: values.id || "preview",
    name: values.name || "Item name",
    price: values.price,
    description: values.description || "Description will appear here…",
    image: values.image,
    tags: values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: values.status,
    isVisible: values.isVisible,
  };

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api<{ path: string }>("/api/content/media", {
        method: "POST",
        body: form,
      });
      set("image", res.path);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        categoryId: values.categoryId,
        name: values.name,
        price: values.price,
        description: values.description,
        image: values.image,
        tags: previewItem.tags,
        status: values.status,
        isVisible: values.isVisible,
      };
      if (mode === "create") {
        await api("/api/admin/items", { method: "POST", body: payload });
        router.push("/mm-ops-admin/items");
        router.refresh();
      } else {
        await api(`/api/admin/items/${values.id}`, { method: "PATCH", body: payload });
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
              placeholder="Aloo Paratha"
              required
              maxLength={128}
            />
          </Field>
          <Field label="Category">
            <Select
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              required
            >
              <option value="" disabled>
                Choose category…
              </option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price (₹)">
            <TextInput
              type="number"
              min={0}
              max={100000}
              value={Number.isFinite(values.price) ? values.price : ""}
              onChange={(e) => set("price", Number(e.target.value))}
              required
            />
          </Field>
          <Field
            label="Status"
            hint="Coming Soon / Out of Stock items show a badge and can't be ordered"
          >
            <Select
              value={values.status}
              onChange={(e) => set("status", e.target.value as ItemStatus)}
            >
              {ITEM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ITEM_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Description">
          <TextArea
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            maxLength={512}
            placeholder="One or two appetizing sentences about the dish."
          />
        </Field>

        <Field label="Image" hint="Paste a URL, or upload — uploads go to Supabase Storage">
          <div className="flex gap-2">
            <TextInput
              value={values.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://…"
              className="flex-1"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </Field>

        <Field label="Tags" hint="Comma-separated — bestseller, new, most-loved, spicy…">
          <TextInput
            value={values.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="bestseller, spicy"
          />
        </Field>

        <Toggle
          checked={values.isVisible}
          onChange={(v) => set("isVisible", v)}
          label="Visible on the website"
        />

        {error && <p className="text-brand-red text-[13px]">{error}</p>}

        <div className="flex items-center gap-3 border-t border-neutral-200/60 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create item" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          {saved && <span className="text-[13px] font-semibold text-green-600">Saved ✓</span>}
        </div>
      </Card>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6">
        <p className="mb-2 text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
          Live preview
        </p>
        <CartProvider>
          <ItemCard
            item={previewItem}
            categoryEmoji={previewCategory?.emoji ?? "🍽️"}
            variant="grid"
          />
        </CartProvider>
        {!values.isVisible && (
          <p className="mt-2 text-[12px] text-neutral-500">
            ⚠ Hidden — customers won&apos;t see this item at all.
          </p>
        )}
      </div>
    </form>
  );
}
