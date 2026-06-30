"use client";

import { useEffect, useState } from "react";
import type { MenuData, MenuItem, SiteData } from "@/lib/types";

const TOKEN_KEY = "mummasMenuAdminToken";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    setToken(saved);
    setChecking(false);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/content/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    });
    if (res.ok) {
      sessionStorage.setItem(TOKEN_KEY, passwordInput);
      setToken(passwordInput);
    } else {
      const data = await res.json().catch(() => ({}));
      setAuthError(data.error || "Login failed");
    }
  }

  if (checking) return null;

  if (!token) {
    return (
      <div className="max-w-sm mx-auto mt-24 px-6">
        <h1 className="font-heading text-2xl mb-4">Admin Login</h1>
        <form onSubmit={handleLogin} className="glass rounded-2xl p-6 flex flex-col gap-3">
          <input
            type="password"
            placeholder="Admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border rounded-lg px-3 py-2"
            autoFocus
          />
          {authError && <p className="text-brand-red text-sm">{authError}</p>}
          <button type="submit" className="bg-brand-red text-white rounded-lg py-2 font-semibold">
            Log in
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard token={token} onLogout={() => { sessionStorage.removeItem(TOKEN_KEY); setToken(null); }} />;
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"menu" | "site">("menu");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl">Content Admin</h1>
        <button onClick={onLogout} className="text-sm text-neutral-600 hover:text-brand-red">
          Log out
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("menu")}
          className={`px-4 py-2 rounded-full font-semibold text-sm ${tab === "menu" ? "bg-brand-red text-white" : "glass"}`}
        >
          Menu Items
        </button>
        <button
          onClick={() => setTab("site")}
          className={`px-4 py-2 rounded-full font-semibold text-sm ${tab === "site" ? "bg-brand-red text-white" : "glass"}`}
        >
          Site Info
        </button>
      </div>

      {tab === "menu" ? <MenuEditor token={token} /> : <SiteEditor token={token} />}
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function MenuEditor({ token }: { token: string }) {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/menu").then((r) => r.json()).then(setMenu);
  }, []);

  if (!menu) return <p>Loading menu…</p>;

  function updateItem(catIdx: number, itemIdx: number, patch: Partial<MenuItem>) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories[catIdx].items[itemIdx] = { ...next.categories[catIdx].items[itemIdx], ...patch };
      return next;
    });
  }

  function addItem(catIdx: number) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories[catIdx].items.push({
        id: `new-item-${Date.now()}`,
        name: "New Item",
        price: 0,
        veg: true,
        description: "",
        image: "",
      });
      return next;
    });
  }

  function removeItem(catIdx: number, itemIdx: number) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories[catIdx].items.splice(itemIdx, 1);
      return next;
    });
  }

  function addCategory() {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories.push({ slug: `new-category-${Date.now()}`, name: "New Category", emoji: "🍽️", items: [] });
      return next;
    });
  }

  function removeCategory(catIdx: number) {
    setMenu((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.categories.splice(catIdx, 1);
      return next;
    });
  }

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/content/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(menu),
    });
    setStatus(res.ok ? "Saved ✓" : "Save failed");
    setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div className="flex flex-col gap-8">
      {menu.categories.map((cat, catIdx) => (
        <div key={cat.slug} className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <input
              value={cat.emoji}
              onChange={(e) =>
                setMenu((prev) => {
                  if (!prev) return prev;
                  const next = structuredClone(prev);
                  next.categories[catIdx].emoji = e.target.value;
                  return next;
                })
              }
              className="border rounded-lg px-2 py-1 w-14 text-center"
            />
            <input
              value={cat.name}
              onChange={(e) =>
                setMenu((prev) => {
                  if (!prev) return prev;
                  const next = structuredClone(prev);
                  next.categories[catIdx].name = e.target.value;
                  next.categories[catIdx].slug = slugify(e.target.value) || next.categories[catIdx].slug;
                  return next;
                })
              }
              className="border rounded-lg px-3 py-1 font-heading text-lg flex-1"
            />
            <button onClick={() => removeCategory(catIdx)} className="text-sm text-brand-red">
              Delete category
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {cat.items.map((item, itemIdx) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-start bg-white/50 rounded-xl p-3">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(catIdx, itemIdx, { name: e.target.value })}
                  placeholder="Name"
                  className="border rounded-lg px-2 py-1"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(catIdx, itemIdx, { price: Number(e.target.value) })}
                  placeholder="Price"
                  className="border rounded-lg px-2 py-1"
                />
                <input
                  value={item.image}
                  onChange={(e) => updateItem(catIdx, itemIdx, { image: e.target.value })}
                  placeholder="/images/items/foo.jpg"
                  className="border rounded-lg px-2 py-1"
                />
                <button onClick={() => removeItem(catIdx, itemIdx)} className="text-sm text-brand-red">
                  Remove
                </button>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(catIdx, itemIdx, { description: e.target.value })}
                  placeholder="Description"
                  className="border rounded-lg px-2 py-1 sm:col-span-4 text-sm"
                  rows={2}
                />
              </div>
            ))}
            <button onClick={() => addItem(catIdx)} className="text-sm font-semibold text-brand-red self-start">
              + Add item
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button onClick={addCategory} className="glass px-4 py-2 rounded-full font-semibold text-sm">
          + Add category
        </button>
        <button onClick={save} className="bg-brand-red text-white px-6 py-2.5 rounded-full font-semibold text-sm">
          Save Menu
        </button>
        {status && <span className="text-sm text-neutral-600">{status}</span>}
      </div>
    </div>
  );
}

function SiteEditor({ token }: { token: string }) {
  const [site, setSite] = useState<SiteData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/site").then((r) => r.json()).then(setSite);
  }, []);

  if (!site) return <p>Loading site info…</p>;

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/content/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(site),
    });
    setStatus(res.ok ? "Saved ✓" : "Save failed");
    setTimeout(() => setStatus(""), 2500);
  }

  function field(label: string, value: string, onChange: (v: string) => void, multiline = false) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">{label}</span>
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} className="border rounded-lg px-3 py-2" rows={3} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} className="border rounded-lg px-3 py-2" />
        )}
      </label>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {field("Brand Name", site.brandName, (v) => setSite({ ...site, brandName: v }))}
      {field("Tagline", site.tagline, (v) => setSite({ ...site, tagline: v }))}
      {field("Description", site.description, (v) => setSite({ ...site, description: v }), true)}
      {field("Site URL", site.siteUrl, (v) => setSite({ ...site, siteUrl: v }))}
      {field("WhatsApp Number (digits, with country code)", site.whatsappNumber, (v) => setSite({ ...site, whatsappNumber: v }))}
      {field("Phone Display", site.phoneDisplay, (v) => setSite({ ...site, phoneDisplay: v }))}
      {field("Email", site.email, (v) => setSite({ ...site, email: v }))}
      {field("Locality / City", site.address.locality, (v) => setSite({ ...site, address: { ...site.address, locality: v } }))}
      {field("Hours", site.hours, (v) => setSite({ ...site, hours: v }))}
      {field("Instagram URL", site.social.instagram, (v) => setSite({ ...site, social: { ...site.social, instagram: v } }))}
      {field("Facebook URL", site.social.facebook, (v) => setSite({ ...site, social: { ...site.social, facebook: v } }))}

      <div className="flex items-center gap-4 mt-2">
        <button onClick={save} className="bg-brand-red text-white px-6 py-2.5 rounded-full font-semibold text-sm">
          Save Site Info
        </button>
        {status && <span className="text-sm text-neutral-600">{status}</span>}
      </div>
    </div>
  );
}
