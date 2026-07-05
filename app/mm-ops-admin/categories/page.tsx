"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button, PageHeader, Pill } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MenuCategory, MenuData } from "@/lib/types";

export default function CategoriesPage() {
  const api = useAdminApi();
  const router = useRouter();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

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
        <PageHeader title="Categories" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </>
    );
  }

  const rows = menu.categories.filter((c) => (showDeleted ? c.deletedAt : !c.deletedAt));

  const columns: Column<MenuCategory>[] = [
    {
      key: "emoji",
      label: "",
      className: "w-[48px]",
      render: (c) => <span className="text-2xl">{c.emoji}</span>,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      sortValue: (c) => c.name,
      render: (c) => (
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-[11px] text-neutral-400">/menu/{c.slug}</p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      sortable: true,
      sortValue: (c) => c.items.filter((i) => !i.deletedAt).length,
      render: (c) => <span>{c.items.filter((i) => !i.deletedAt).length}</span>,
    },
    {
      key: "order",
      label: "Order",
      sortable: true,
      sortValue: (c) => c.sortOrder ?? 0,
      render: (c) => <span className="text-neutral-500">{c.sortOrder ?? 0}</span>,
    },
    {
      key: "visible",
      label: "Visible",
      render: (c) =>
        c.deletedAt ? (
          <Pill tone="red">Deleted</Pill>
        ) : c.isVisible === false ? (
          <Pill tone="grey">Hidden</Pill>
        ) : (
          <Pill tone="green">Live</Pill>
        ),
    },
    {
      key: "updated",
      label: "Updated",
      sortable: true,
      sortValue: (c) => c.updatedAt ?? "",
      render: (c) => (
        <span className="text-[12px] text-neutral-500">
          {c.updatedAt
            ? new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Sections of the menu — order controls how they appear on the site"
        actions={
          <Link href="/mm-ops-admin/categories/new">
            <Button>+ New Category</Button>
          </Link>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id ?? c.slug}
        searchText={(c) => `${c.name} ${c.slug}`}
        searchPlaceholder="Search categories…"
        pageSize={10}
        emptyMessage={showDeleted ? "Recycle bin is empty." : "No categories yet."}
        onRowClick={(c) => router.push(`/mm-ops-admin/categories/${c.id}`)}
        toolbar={
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-600">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="accent-brand-red"
            />
            Recycle bin
          </label>
        }
      />
    </>
  );
}
