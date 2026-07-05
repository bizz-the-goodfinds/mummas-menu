"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Button, ConfirmDialog, PageHeader, Pill } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MenuData } from "@/lib/types";

export default function EditCategoryPage() {
  const api = useAdminApi();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

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
        <PageHeader title="Edit Category" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </>
    );
  }

  const category = menu.categories.find((c) => c.id === id);
  if (!category) return <p className="text-sm text-neutral-500">Category not found.</p>;
  const isDeleted = Boolean(category.deletedAt);
  const liveItemCount = category.items.filter((i) => !i.deletedAt).length;

  async function handleDelete() {
    setBusy(true);
    try {
      await api(`/api/admin/categories/${id}`, { method: "DELETE" });
      router.push("/mm-ops-admin/categories");
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
      await api(`/api/admin/categories/${id}`, { method: "PATCH", body: { deletedAt: null } });
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
        title={`Edit: ${category.name}`}
        subtitle={
          category.updatedAt
            ? `Updated ${new Date(category.updatedAt).toLocaleString("en-IN")}`
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

      <CategoryForm
        mode="edit"
        initial={{
          id: category.id!,
          slug: category.slug,
          name: category.name,
          emoji: category.emoji,
          sortOrder: category.sortOrder ?? 0,
          isVisible: category.isVisible !== false,
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this category?"
        body={`“${category.name}” and its ${liveItemCount} items will be removed from the website and moved to the recycle bin. You can restore the category later (items must be restored individually).`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
