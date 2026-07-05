"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { ItemForm } from "@/components/admin/ItemForm";
import { Button, ConfirmDialog, PageHeader, Pill } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MenuData, MenuItem } from "@/lib/types";

export default function EditItemPage() {
  const api = useAdminApi();
  const router = useRouter();
  const { id: rawId } = useParams<{ id: string }>();
  const id = decodeURIComponent(rawId);

  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<MenuData>("/api/admin/menu")
      .then(setMenu)
      .catch((e) => setError(e.message));
  }, [api]);
  useEffect(load, [load]);

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!menu) {
    return (
      <>
        <PageHeader title="Edit Item" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </>
    );
  }

  let found: { item: MenuItem; categoryId: string } | null = null;
  for (const cat of menu.categories) {
    const item = cat.items.find((i) => i.id === id);
    if (item) {
      found = { item, categoryId: cat.id! };
      break;
    }
  }
  if (!found) return <p className="text-sm text-neutral-500">Item “{id}” not found.</p>;

  const { item, categoryId } = found;
  const isDeleted = Boolean(item.deletedAt);

  async function handleDelete() {
    setBusy(true);
    try {
      await api(`/api/admin/items/${encodeURIComponent(id)}`, { method: "DELETE" });
      router.push("/mm-ops-admin/items");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    try {
      await api(`/api/admin/items/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { deletedAt: null },
      });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={`Edit: ${item.name}`}
        subtitle={
          item.createdAt
            ? `Created ${new Date(item.createdAt).toLocaleDateString("en-IN")} · Updated ${new Date(item.updatedAt!).toLocaleString("en-IN")}`
            : undefined
        }
        actions={
          isDeleted ? (
            <>
              <Pill tone="red">In recycle bin</Pill>
              <Button variant="secondary" onClick={handleRestore} disabled={busy}>
                {busy ? "Restoring…" : "Restore"}
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          )
        }
      />

      <ItemForm
        mode="edit"
        categories={menu.categories}
        initial={{
          id: item.id,
          categoryId,
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          tags: (item.tags ?? []).join(", "),
          status: item.status ?? "available",
          isVisible: item.isVisible !== false,
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this item?"
        body={`“${item.name}” will be removed from the website but kept in the recycle bin — you can restore it any time.`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
