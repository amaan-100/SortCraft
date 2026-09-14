import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Only the *anon* public key is ever used in the browser.
 * NEVER import a service-role key into client code — it bypasses RLS.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "sortcraft-auth",
      },
    })
  : null;

export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  current_level: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
}
