import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, requireEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Cliente com a chave secreta (`SUPABASE_SECRET_KEY`, `sb_secret_...`): ignora a RLS.
 * Só no servidor e só para o que o cliente não pode gravar (XP, emblemas, colheitas,
 * temas). Nunca importe isto num componente cliente (o `server-only` impede).
 */
export function createAdminClient() {
  const { supabaseUrl } = publicEnv();
  const secret = requireEnv("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
  return createSupabaseClient<Database>(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AdminClient = ReturnType<typeof createAdminClient>;
