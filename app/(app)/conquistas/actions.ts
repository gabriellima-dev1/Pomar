"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  canUseTheme,
  isThemeCode,
  isThemePreference,
  type ThemeCode,
  type ThemePreference,
} from "@/lib/gamification/themes";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/telemetry.server";

/**
 * Ações das conquistas. Trocar o tema passa pelo servidor (o cliente não tem grant
 * em `profiles.theme`); marcar como visto usa a sessão (grant só em seen_at,
 * tab_seen_at e level_seen, com RLS).
 */

type Result = { ok: true } | { ok: false; error: string };

const GENERIC = "Não consegui falar com o servidor. Confira a internet e tente de novo.";

/** Aplica um tema desbloqueado, ou `auto` (seguir o modo escuro do aparelho). */
export async function setTheme(code: ThemePreference): Promise<Result> {
  const user = await requireUser();
  if (!isThemePreference(code)) return { ok: false, error: "Tema inválido." };

  const supabase = await createClient();
  const [{ data: profile }, { data: unlocked }] = await Promise.all([
    supabase.from("profiles").select("is_admin, theme").eq("id", user.id).maybeSingle(),
    supabase.from("user_themes").select("theme_code"),
  ]);
  const owned = new Set((unlocked ?? []).map((t) => t.theme_code));
  if (code !== "auto" && !canUseTheme(code, owned, profile?.is_admin ?? false)) {
    return { ok: false, error: "Esse tema ainda não foi conquistado." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ theme: code }).eq("id", user.id);
  if (error) return { ok: false, error: GENERIC };
  if (code !== "auto") {
    await supabase
      .from("user_themes")
      .update({ tab_seen_at: new Date().toISOString(), seen_at: new Date().toISOString() })
      .eq("theme_code", code)
      .is("tab_seen_at", null);
  }
  if (profile?.theme !== code) await trackServer("theme_changed", { code });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Abriu a aba Temas: o selo "Novo · conquistado" some. */
export async function markThemesTabSeen(): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  await supabase
    .from("user_themes")
    .update({ tab_seen_at: new Date().toISOString() })
    .is("tab_seen_at", null);
}

/** Revelação dos frutos vista ("Colher"). */
export async function markBadgesSeen(days: string[]): Promise<void> {
  await requireUser();
  const valid = days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 60);
  if (valid.length === 0) return;
  const supabase = await createClient();
  await supabase
    .from("user_daily_badges")
    .update({ seen_at: new Date().toISOString() })
    .in("day", valid)
    .is("seen_at", null);
}

/** Tela "Tema desbloqueado" vista ("Depois"). */
export async function markThemeRevealSeen(code: ThemeCode): Promise<void> {
  await requireUser();
  if (!isThemeCode(code)) return;
  const supabase = await createClient();
  await supabase
    .from("user_themes")
    .update({ seen_at: new Date().toISOString() })
    .eq("theme_code", code)
    .is("seen_at", null);
}

/** Celebração de nível vista. */
export async function markLevelSeen(level: number): Promise<void> {
  const user = await requireUser();
  if (!Number.isInteger(level) || level < 1 || level > 1000) return;
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ level_seen: level })
    .eq("id", user.id)
    .lt("level_seen", level);
}
