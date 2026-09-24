import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const missingEnvVars: string[] = [];
if (!rawUrl) missingEnvVars.push("VITE_SUPABASE_URL");
if (!rawKey) missingEnvVars.push("VITE_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = missingEnvVars.length === 0;

export const supabaseUrl = rawUrl;
export const supabaseAnonKey = rawKey;

/**
 * Client Supabase. Saat env kosong, client dibuat dengan placeholder
 * agar module load tidak melempar error; <ConfigGuard> akan menampilkan
 * layar konfigurasi yang jelas kepada pengguna.
 */
export const supabase: SupabaseClient = createClient(
  rawUrl || "https://placeholder.supabase.co",
  rawKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);