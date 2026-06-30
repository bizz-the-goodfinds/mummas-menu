"use client";

import { useEffect, useState } from "react";
import type { MenuData, OrderLog, SiteData } from "@/lib/types";

export function Dashboard({
  token,
  onNavigate,
}: {
  token: string;
  onNavigate: (tab: string) => void;
}) {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [site, setSite] = useState<SiteData | null>(null);
  const [orders, setOrders] = useState<OrderLog | null>(null);

  useEffect(() => {
    fetch("/api/content/menu")
      .then((r) => r.json())
      .then(setMenu);
    fetch("/api/content/site")
      .then((r) => r.json())
      .then(setSite);
    fetch("/api/content/orders", { headers: { "x-admin-token": token } })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then(setOrders);
  }, [token]);

  const itemCount = menu?.categories.reduce((s, c) => s + c.items.length, 0) ?? 0;
  const orderCount = orders?.orders.length ?? 0;
  const revenue = orders?.orders.reduce((s, o) => s + o.total, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Menu Items"
          value={itemCount}
          icon="🍽️"
          onClick={() => onNavigate("menu")}
        />
        <StatCard
          label="Categories"
          value={menu?.categories.length ?? 0}
          icon="📂"
          onClick={() => onNavigate("menu")}
        />
        <StatCard
          label="Orders Logged"
          value={orderCount}
          icon="🧾"
          onClick={() => onNavigate("orders")}
        />
        <StatCard
          label="Revenue Logged"
          value={`₹${revenue}`}
          icon="💰"
          onClick={() => onNavigate("orders")}
        />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-heading mb-3 text-lg font-bold">Quick Checklist</h2>
        <ul className="flex flex-col gap-2 text-sm">
          <ChecklistItem
            ok={!!site && site.fssai.licenceNumber !== "XXXXXXXXXXXX"}
            label="Real FSSAI licence number set"
          />
          <ChecklistItem ok={!!site?.fssai.certImage} label="FSSAI certificate image uploaded" />
          <ChecklistItem
            ok={!!site && site.address.street.trim().length > 0}
            label="Full street address set"
          />
          <ChecklistItem
            ok={!!site && /^\d{10,15}$/.test(site.whatsappNumber)}
            label="WhatsApp number configured"
          />
          <ChecklistItem ok={itemCount > 0} label="Menu items added" />
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5"
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="font-heading text-xl font-bold">{value}</span>
      <span className="text-xs text-neutral-500">{label}</span>
    </button>
  );
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={ok ? "text-green-600" : "text-neutral-300"}>{ok ? "✅" : "⬜"}</span>
      <span className={ok ? "text-neutral-700" : "text-neutral-500"}>{label}</span>
    </li>
  );
}
