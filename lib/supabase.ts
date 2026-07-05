import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env",
  );
}

// Server-only client using the secret key: bypasses RLS, so it must never be
// imported from client components ("server-only" enforces this at build time).
export const supabaseAdmin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const IMAGES_BUCKET = "images";

export function storagePublicUrl(path: string): string {
  return `${url}/storage/v1/object/public/${IMAGES_BUCKET}/${path}`;
}
