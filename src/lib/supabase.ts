import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. The publishable key is safe to ship to the browser; row-level
 * security on each table decides what a signed-in student can read and write.
 */
const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Sign-in isn't configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return supabase;
}
