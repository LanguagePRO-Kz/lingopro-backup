/**
 * Service-role Supabase client (bypasses RLS). Server-only — never import
 * from client components. Returns null when the secret key isn't configured;
 * callers must degrade gracefully.
 */

import { createClient as createSupabaseJs, type SupabaseClient } from "@supabase/supabase-js";

export function createAdminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) return null;
  return createSupabaseJs(url, key, { auth: { persistSession: false } });
}
