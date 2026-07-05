import "server-only";
import { supabaseAdmin } from "./supabase";

// Admin requests carry a Supabase Auth access token (JWT) in x-admin-token —
// issued by signing in with email + password on the admin portal. The token is
// verified against Supabase on every request, and only users carrying the
// admin role (set by scripts/migrate-to-supabase.mjs in app_metadata) pass.
// app_metadata can't be modified by the user themselves, so a self-signed-up
// account can never reach admin APIs.
export async function isAuthorized(req: Request): Promise<boolean> {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!token) return false;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return false;
  return data.user.app_metadata?.role === "admin";
}
