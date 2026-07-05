"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { PageHeader, Card, Pill } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MenuData, OrderLog } from "@/lib/types";

export default function DashboardPage() {
  const api = useAdminApi();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [orders, setOrders] = useState<OrderLog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<MenuData>("/api/admin/menu"), api<OrderLog>("/api/content/orders")])
      .then(([m, o]) => {
        setMenu(m);
        setOrders(o);
      })
      .catch((e) => setError(e.message));
  }, [api]);

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!menu || !orders) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const allItems = menu.categories.flatMap((c) => c.items);
  const liveItems = allItems.filter((i) => i.isVisible !== false && !i.deletedAt);
  const hiddenItems = allItems.filter((i) => i.isVisible === false && !i.deletedAt);
  const deletedItems = allItems.filter((i) => i.deletedAt);
  const revenue = orders.orders.reduce((s, o) => s + o.total, 0);
  const recent = [...orders.orders].reverse().slice(0, 6);

  const stats = [
    { label: "Live items", value: liveItems.length, href: "/mm-ops-admin/items" },
    {
      label: "Categories",
      value: menu.categories.filter((c) => !c.deletedAt).length,
      href: "/mm-ops-admin/categories",
    },
    { label: "Orders logged", value: orders.orders.length, href: "/mm-ops-admin/orders" },
    {
      label: "Order value",
      value: `₹${revenue.toLocaleString("en-IN")}`,
      href: "/mm-ops-admin/orders",
    },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="What's happening across the kitchen" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-lg">
              <p className="text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
                {s.label}
              </p>
              <p className="font-heading text-brand-red mt-1 text-[28px] font-bold">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-heading mb-3 text-[16px] font-bold">Item health</h2>
          <div className="flex flex-col gap-2 text-[13.5px]">
            <div className="flex items-center justify-between">
              <span>Visible to customers</span>
              <Pill tone="green">{liveItems.length}</Pill>
            </div>
            <div className="flex items-center justify-between">
              <span>Hidden</span>
              <Pill tone="grey">{hiddenItems.length}</Pill>
            </div>
            <div className="flex items-center justify-between">
              <span>Out of stock</span>
              <Pill tone="grey">{liveItems.filter((i) => i.status === "out-of-stock").length}</Pill>
            </div>
            <div className="flex items-center justify-between">
              <span>Coming soon</span>
              <Pill tone="sky">{liveItems.filter((i) => i.status === "coming-soon").length}</Pill>
            </div>
            <div className="flex items-center justify-between">
              <span>Festive specials</span>
              <Pill tone="amber">
                {liveItems.filter((i) => i.status === "festive-special").length}
              </Pill>
            </div>
            <div className="flex items-center justify-between">
              <span>In recycle bin</span>
              <Pill tone="red">{deletedItems.length}</Pill>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading mb-3 text-[16px] font-bold">Recent orders</h2>
          {recent.length === 0 ? (
            <p className="text-[13px] text-neutral-400">No orders logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-[13px]">
                  <span className="truncate pr-3 text-neutral-600">
                    {new Date(o.timestamp).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {o.items.reduce((s, l) => s + l.qty, 0)} items
                  </span>
                  <strong className="text-brand-red">₹{o.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
