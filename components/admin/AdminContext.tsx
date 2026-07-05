"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Skeleton } from "@/components/ui/Skeleton";

interface AdminContextValue {
  token: string;
  email: string;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminGate>");
  return ctx;
}

/**
 * Auth gate for every admin page: shows a skeleton while the Supabase
 * session loads, the login form when signed out, and provides the current
 * access token (kept fresh by supabase-js auto-refresh) to children.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ token: string; email: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s ? { token: s.access_token, email: s.user.email ?? "" } : null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { token: s.access_token, email: s.user.email ?? "" } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="mx-auto mt-24 max-w-sm px-6">
        <Skeleton className="mb-4 h-8 w-40" />
        <div className="glass flex flex-col gap-3 rounded-2xl p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return (
    <AdminContext.Provider
      value={{
        token: session.token,
        email: session.email,
        logout: () => void getSupabaseBrowser().auth.signOut(),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(
        /invalid login credentials/i.test(error.message)
          ? "Incorrect email or password"
          : error.message,
      );
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-6">
      <h1 className="font-heading mb-1 text-2xl">Admin Login</h1>
      <p className="mb-4 text-[13px] text-neutral-500">Mumma&apos;s Menu — staff only</p>
      <form onSubmit={handleLogin} className="glass flex flex-col gap-3 rounded-2xl p-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus:ring-brand-red/30 rounded-lg border border-neutral-200 bg-white px-3 py-2 focus:ring-2 focus:outline-none"
          autoComplete="username"
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus:ring-brand-red/30 rounded-lg border border-neutral-200 bg-white px-3 py-2 focus:ring-2 focus:outline-none"
          autoComplete="current-password"
        />
        {error && <p className="text-brand-red text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-brand-red rounded-lg py-2 font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
