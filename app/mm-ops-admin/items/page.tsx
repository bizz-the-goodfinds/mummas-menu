"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button, PageHeader, Pill, Select } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { ITEM_STATUS_LABELS } from "@/lib/types";
import type { AdminMenuItem, MenuData } from "@/lib/types";

type Row = AdminMenuItem;

export default function ItemsPage() {
  const api = useAdminApi();
  const router = useRouter();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleted, setShowDeleted] = useState(false);

  const load = useCallback(() => {
    api<MenuData>("/api/admin/menu")
      .then(setMenu)
      .catch((e) => setError(e.message));
  }, [api]);

  useEffect(load, [load]);

  const rows: Row[] = useMemo(() => {
    if (!menu) return [];
    return menu.categories.flatMap((cat) =>
      cat.items.map((item) => ({
        ...item,
        categoryId: cat.id!,
        categorySlug: cat.slug,
        categoryName: cat.name,
        categoryEmoji: cat.emoji,
        sortOrder: 0,
      })),
    );
  }, [menu]);

  const filtered = rows.filter((r) => {
    if (!showDeleted && r.deletedAt) return false;
    if (showDeleted && !r.deletedAt) return false;
    if (categoryFilter !== "all" && r.categoryId !== categoryFilter) return false;
    if (statusFilter === "hidden") return r.isVisible === false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<Row>[] = [
    {
      key: "image",
      label: "",
      className: "w-[56px]",
      render: (r) =>
        r.image ? (
          <Image
            src={r.image}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <span className="bg-brand-pink flex h-10 w-10 items-center justify-center rounded-lg text-lg">
            {r.categoryEmoji}
          </span>
        ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="font-semibold">{r.name}</p>
          <p className="text-[11px] text-neutral-400">{r.id}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      sortValue: (r) => r.categoryName,
      render: (r) => (
        <span className="text-neutral-600">
          {r.categoryEmoji} {r.categoryName}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      sortValue: (r) => r.price,
      render: (r) => <strong className="text-brand-red">₹{r.price}</strong>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => r.status ?? "available",
      render: (r) => {
        const tone =
          r.status === "out-of-stock"
            ? "grey"
            : r.status === "coming-soon"
              ? "sky"
              : r.status === "festive-special"
                ? "amber"
                : "green";
        return <Pill tone={tone}>{ITEM_STATUS_LABELS[r.status ?? "available"]}</Pill>;
      },
    },
    {
      key: "visible",
      label: "Visible",
      render: (r) =>
        r.deletedAt ? (
          <Pill tone="red">Deleted</Pill>
        ) : r.isVisible === false ? (
          <Pill tone="grey">Hidden</Pill>
        ) : (
          <Pill tone="green">Live</Pill>
        ),
    },
    {
      key: "updated",
      label: "Updated",
      sortable: true,
      sortValue: (r) => r.updatedAt ?? "",
      render: (r) => (
        <span className="text-[12px] text-neutral-500">
          {r.updatedAt
            ? new Date(r.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
            : "—"}
        </span>
      ),
    },
  ];

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!menu) {
    return (
      <>
        <PageHeader title="Menu Items" />
        <Skeleton className="mb-3 h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </>
    );
  }

  const activeCategories = menu.categories.filter((c) => !c.deletedAt);

  return (
    <>
      <PageHeader
        title="Menu Items"
        subtitle="Add, edit, hide, or soft-delete dishes — changes go live instantly"
        actions={
          <Link href="/mm-ops-admin/items/new">
            <Button>+ New Item</Button>
          </Link>
        }
      />
      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.name} ${r.id} ${r.categoryName}`}
        searchPlaceholder="Search items…"
        pageSize={10}
        emptyMessage={showDeleted ? "Recycle bin is empty." : "No items match."}
        onRowClick={(r) => router.push(`/mm-ops-admin/items/${encodeURIComponent(r.id)}`)}
        toolbar={
          <>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="!w-auto"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="!w-auto"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="festive-special">Festive Special</option>
              <option value="hidden">Hidden</option>
            </Select>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-600">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="accent-brand-red"
              />
              Recycle bin
            </label>
          </>
        }
      />
    </>
  );
}
