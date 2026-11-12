import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";
import type { LandingStats } from "./landing-stats";

/**
 * Números da landing pela função `landing_stats()` (só totais, sem contas demo),
 * com um cliente sem cookies: a página fica estática e se refaz a cada poucos minutos.
 */
export async function getLandingStats(): Promise<LandingStats | null> {
  try {
    const { supabaseUrl, supabasePublishableKey } = publicEnv();
    const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("landing_stats");
    const row = data?.[0];
    if (error || !row) return null;
    return {
      pomodorosWeek: row.pomodoros_week,
      focusSecWeek: row.focus_sec_week,
      gardeners: row.gardeners,
    };
  } catch (error) {
    console.error("[landing] contadores", error);
    return null;
  }
}
