"use client";

import { useEffect, useState } from "react";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button, Card, PageHeader } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { OrderEntry, OrderLog } from "@/lib/types";

export default function OrdersPage() {
  const api = useAdminApi();
  const [log, setLog] = useState<OrderLog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<OrderLog>("/api/content/orders")
      .then(setLog)
      .catch((e) => setError(e.message));
  }, [api]);

  function exportCsv() {
    if (!log) return;
    const rows = [
      ["Date", "Items", "Total", "Source"],
      ...log.orders.map((o) => [
        new Date(o.timestamp).toLocaleString("en-IN"),
        o.items.map((i) => `${i.name} x${i.qty}`).join("; "),
        String(o.total),
        o.source,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!log) {
    return (
      <>
        <PageHeader title="Orders" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </>
    );
  }

  const totalRevenue = log.orders.reduce((s, o) => s + o.total, 0);

  const columns: Column<OrderEntry>[] = [
    {
      key: "time",
      label: "Date",
      sortable: true,
      sortValue: (o) => o.timestamp,
      render: (o) => (
        <span className="font-medium">
          {new Date(o.timestamp).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (o) => (
        <span className="line-clamp-2 max-w-[380px] text-neutral-600">
          {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
        </span>
      ),
    },
    {
      key: "qty",
      label: "Qty",
      sortable: true,
      sortValue: (o) => o.items.reduce((s, l) => s + l.qty, 0),
      render: (o) => <span>{o.items.reduce((s, l) => s + l.qty, 0)}</span>,
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      sortValue: (o) => o.total,
      render: (o) => <strong className="text-brand-red">₹{o.total}</strong>,
    },
    {
      key: "source",
      label: "Source",
      render: (o) => <span className="text-[12px] text-neutral-400">{o.source}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Checkout log — the WhatsApp chat is the source of truth for fulfilment"
        actions={
          <Button variant="secondary" onClick={exportCsv} disabled={log.orders.length === 0}>
            ⬇ Export CSV
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 sm:max-w-md">
        <Card>
          <p className="text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
            Total orders
          </p>
          <p className="font-heading text-brand-red mt-1 text-[24px] font-bold">
            {log.orders.length}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
            Order value
          </p>
          <p className="font-heading text-brand-red mt-1 text-[24px] font-bold">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      <DataTable
        rows={[...log.orders].reverse()}
        columns={columns}
        rowKey={(o) => o.id}
        searchText={(o) => o.items.map((i) => i.name).join(" ")}
        searchPlaceholder="Search by dish…"
        pageSize={10}
        emptyMessage="No orders logged yet."
      />
    </>
  );
}
