import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminContext";
import { AdminShell } from "@/components/admin/AdminShell";

// Unlisted admin portal: not linked anywhere, not in the sitemap, and marked
// noindex so it never shows up in search results. The path itself is only
// obscurity — real protection is Supabase Auth on every page and API call.
export const metadata: Metadata = {
  title: "Admin — Mumma's Menu",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
