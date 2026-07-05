"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminContext";

const BASE = "/mm-ops-admin";

const NAV: { href: string; label: string; icon: string; exact?: boolean }[] = [
  { href: BASE, label: "Dashboard", icon: "📊", exact: true },
  { href: `${BASE}/items`, label: "Menu Items", icon: "🍱" },
  { href: `${BASE}/categories`, label: "Categories", icon: "🗂️" },
  { href: `${BASE}/orders`, label: "Orders", icon: "🧾" },
  { href: `${BASE}/site`, label: "Site Content", icon: "🏠" },
  { href: `${BASE}/messages`, label: "WhatsApp Messages", icon: "💬" },
  { href: `${BASE}/media`, label: "Media", icon: "🖼️" },
  { href: `${BASE}/backups`, label: "Backups", icon: "🗄️" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { email, logout } = useAdmin();

  const linkCls = (active: boolean) =>
    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors ${
      active ? "bg-brand-red text-white shadow-sm" : "text-neutral-700 hover:bg-white/70"
    }`;

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar (desktop) */}
      <aside className="glass-strong sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-white/60 p-4 lg:flex">
        <Link href={BASE} className="mb-6 flex items-center gap-2 px-2">
          <span className="text-xl">👩‍🍳</span>
          <div>
            <p className="font-heading text-[15px] leading-tight font-bold">Mumma&apos;s Menu</p>
            <p className="text-[11px] text-neutral-500">Admin Panel</p>
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={linkCls(active)}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/60 pt-3">
          <p className="truncate px-2 text-[11px] text-neutral-500" title={email}>
            {email}
          </p>
          <button
            onClick={logout}
            className="hover:text-brand-red mt-1 px-2 text-[13px] font-medium text-neutral-600"
          >
            Log out →
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="glass-strong sticky top-0 z-20 border-b border-white/60 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href={BASE} className="font-heading text-[15px] font-bold">
              👩‍🍳 Admin
            </Link>
            <button
              onClick={logout}
              className="hover:text-brand-red text-[13px] font-medium text-neutral-600"
            >
              Log out
            </button>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap ${
                    active ? "bg-brand-red text-white" : "bg-white/70 text-neutral-600"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
