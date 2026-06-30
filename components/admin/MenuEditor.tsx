"use client";

import { useEffect, useState } from "react";
import type { MenuData, MenuItem } from "@/lib/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function MenuEditor({ token }: { token: string }) {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/menu")
      .then((r) => r.json())
      .then(setMenu);
  }, []);

  if (!menu) return <p className="text-sm text-neutral-500">Loading menu…</p>;

  function updateItem(catIdx: number, itemIdx: number, patch: Partial<MenuItem>) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories[catIdx].items[itemIdx] = {
        ...next.categories[catIdx].items[itemIdx],
        ...patch,
      };
      return next;
    });
  }

  function addItem(catIdx: number) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories[catIdx].items.push({
        id: `new-item-${Date.now()}`,
        name: "New Item",
        price: 0,
        veg: true,
        description: "",
        image: "",
      });
      return next;
    });
  }

  function removeItem(catIdx: number, itemIdx: number) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories[catIdx].items.splice(itemIdx, 1);
      return next;
    });
  }

  function addCategory() {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories.push({
        slug: `new-category-${Date.now()}`,
        name: "New Category",
        emoji: "🍽️",
        items: [],
      });
      return next;
    });
  }

  function removeCategory(catIdx: number) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories.splice(catIdx, 1);
      return next;
    });
  }

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/content/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(menu),
    });
    setStatus(res.ok ? "Saved ✓" : "Save failed");
    setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div className="flex flex-col gap-8">
      {menu.categories.map((cat, catIdx) => (
        <div key={cat.slug} className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <input
              value={cat.emoji}
              onChange={(e) =>
                setMenu((prev) => {
                  if (!prev) return prev;
                  const next = structuredClone(prev);
                  next.categories[catIdx].emoji = e.target.value;
                  return next;
                })
              }
              className="w-14 rounded-lg border px-2 py-1 text-center"
            />
            <input
              value={cat.name}
              onChange={(e) =>
                setMenu((prev) => {
                  if (!prev) return prev;
                  const next = structuredClone(prev);
                  next.categories[catIdx].name = e.target.value;
                  next.categories[catIdx].slug =
                    slugify(e.target.value) || next.categories[catIdx].slug;
                  return next;
                })
              }
              className="font-heading flex-1 rounded-lg border px-3 py-1 text-lg"
            />
            <button onClick={() => removeCategory(catIdx)} className="text-brand-red text-sm">
              Delete category
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {cat.items.map((item, itemIdx) => (
              <div
                key={item.id}
                className="grid grid-cols-1 items-start gap-2 rounded-xl bg-white/50 p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <input
                  value={item.name}
                  onChange={(e) => updateItem(catIdx, itemIdx, { name: e.target.value })}
                  placeholder="Name"
                  className="rounded-lg border px-2 py-1"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(catIdx, itemIdx, { price: Number(e.target.value) })}
                  placeholder="Price"
                  className="rounded-lg border px-2 py-1"
                />
                <input
                  value={item.image}
                  onChange={(e) => updateItem(catIdx, itemIdx, { image: e.target.value })}
                  placeholder="https://... or /images/uploads/..."
                  className="rounded-lg border px-2 py-1"
                />
                <button
                  onClick={() => removeItem(catIdx, itemIdx)}
                  className="text-brand-red text-sm"
                >
                  Remove
                </button>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(catIdx, itemIdx, { description: e.target.value })}
                  placeholder="Description"
                  className="rounded-lg border px-2 py-1 text-sm sm:col-span-4"
                  rows={2}
                />
                <label className="flex items-center gap-1.5 text-xs sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={item.veg}
                    onChange={(e) => updateItem(catIdx, itemIdx, { veg: e.target.checked })}
                  />
                  Veg
                </label>
                <input
                  value={item.tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateItem(catIdx, itemIdx, {
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="tags: bestseller, new, spicy"
                  className="rounded-lg border px-2 py-1 text-xs sm:col-span-2"
                />
              </div>
            ))}
            <button
              onClick={() => addItem(catIdx)}
              className="text-brand-red self-start text-sm font-semibold"
            >
              + Add item
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          onClick={addCategory}
          className="glass rounded-full px-4 py-2 text-sm font-semibold"
        >
          + Add category
        </button>
        <button
          onClick={save}
          className="bg-brand-red rounded-full px-6 py-2.5 text-sm font-semibold text-white"
        >
          Save Menu
        </button>
        {status && <span className="text-sm text-neutral-600">{status}</span>}
      </div>
    </div>
  );
}
