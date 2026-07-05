"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Browser client with the publishable key — used only for admin authentication.
// All data reads/writes go through our API routes (server-side, secret key);
// RLS denies everything to anon/authenticated roles, so this client can't
// touch data even if abused.
export function getSupabaseBrowser(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Supabase browser env vars are not configured");
    client = createClient(url, key);
  }
  return client;
}
