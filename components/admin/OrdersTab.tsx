"use client";

import { useEffect, useState } from "react";
import type { OrderLog } from "@/lib/types";

export function OrdersTab({ token }: { token: string }) {
  const [log, setLog] = useState<OrderLog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/content/orders", { headers: { "x-admin-token": token } })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setLog)
      .catch(() => setError("Failed to load orders"));
  }, [token]);

  function exportCsv() {
    if (!log) return;
    const rows = [
      ["Date", "Items", "Total", "Source"],
      ...log.orders.map((o) => [
        new Date(o.timestamp).toLocaleString(),
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
  if (!log) return <p className="text-sm text-neutral-500">Loading orders…</p>;

  const orders = [...log.orders].reverse();
  const totalRevenue = log.orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-xs text-neutral-500">Total Orders</p>
          <p className="font-heading text-xl font-bold">{log.orders.length}</p>
        </div>
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-xs text-neutral-500">Total Revenue</p>
          <p className="font-heading text-xl font-bold">₹{totalRevenue}</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={orders.length === 0}
          className="glass-strong ml-auto rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">No orders logged yet.</p>
      ) : (
        <div className="glass flex flex-col gap-2 rounded-2xl p-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl bg-white/50 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{new Date(o.timestamp).toLocaleString()}</span>
                <span className="text-brand-red font-bold">₹{o.total}</span>
              </div>
              <p className="mt-1 text-neutral-600">
                {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </p>
              <p className="mt-1 text-xs text-neutral-400">via {o.source}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
