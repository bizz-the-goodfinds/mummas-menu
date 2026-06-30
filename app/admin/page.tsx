"use client";

import { useState } from "react";
import { Dashboard } from "@/components/admin/Dashboard";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { SiteEditor } from "@/components/admin/SiteEditor";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { MessagesTab } from "@/components/admin/MessagesTab";
import { MediaTab } from "@/components/admin/MediaTab";

const TOKEN_KEY = "mummasMenuAdminToken";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "menu", label: "Menu Editor" },
  { id: "site", label: "Site Editor" },
  { id: "orders", label: "Orders" },
  { id: "messages", label: "Messages" },
  { id: "media", label: "Media" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null,
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/content/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { token?: string };
      const tok = data.token ?? "";
      sessionStorage.setItem(TOKEN_KEY, tok);
      setToken(tok);
    } else {
      const data = await res.json().catch(() => ({}));
      setAuthError(data.error || "Login failed");
    }
  }

  if (!token) {
    return (
      <div className="mx-auto mt-24 max-w-sm px-6">
        <h1 className="font-heading mb-4 text-2xl">Admin Login</h1>
        <form onSubmit={handleLogin} className="glass flex flex-col gap-3 rounded-2xl p-6">
          <input
            type="password"
            placeholder="Admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="rounded-lg border px-3 py-2"
            autoFocus
          />
          {authError && <p className="text-brand-red text-sm">{authError}</p>}
          <button type="submit" className="bg-brand-red rounded-lg py-2 font-semibold text-white">
            Log in
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminDashboard
      token={token}
      onLogout={() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }}
    />
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Content Admin</h1>
        <button onClick={onLogout} className="hover:text-brand-red text-sm text-neutral-600">
          Log out
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-brand-red text-white" : "glass"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <Dashboard token={token} onNavigate={(t) => setTab(t as TabId)} />}
      {tab === "menu" && <MenuEditor token={token} />}
      {tab === "site" && <SiteEditor token={token} />}
      {tab === "orders" && <OrdersTab token={token} />}
      {tab === "messages" && <MessagesTab token={token} />}
      {tab === "media" && <MediaTab token={token} />}
    </div>
  );
}
