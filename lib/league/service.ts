import "server-only";
import { addDays } from "@/lib/dates";
import { createAdminClient, type AdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { weeklyHours } from "./bands";
import { isDivision, type Division } from "./divisions";
import { planGroups, type Participant } from "./grouping";
import { closeGroup, type GroupResult, type Standing } from "./ranking";
import { firstFreeUsername, suggestUsername } from "./username";
import { leagueWeek, weekWindow } from "./week";

/**
 * Feira no servidor (DESIGN §6.6): monta os grupos da semana, fecha a anterior e
 * muda as divisões. Tudo com a chave secreta; o cliente nunca grava posição nem XP.
 * Chamado pelo cron de segunda (app/api/cron/ligas), pela rede de segurança ao abrir
 * a Liga e pelo script `npm run league:close`.
 */

/** Dá um apelido a quem entrou na Feira sem escolher um (DECISOES 11/11). */
async function ensureUsernames(
  admin: AdminClient,
  people: { id: string; username: string | null; display_name: string | null }[],
): Promise<void> {
  for (const p of people.filter((x) => !x.username)) {
    const base = suggestUsername(p.display_name);
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: taken } = await admin
        .from("profiles")
        .select("username")
        .like("username", `${base.slice(0, 17)}%`);
      const candidate = firstFreeUsername(
        base,
        new Set((taken ?? []).map((t) => t.username).filter((u): u is string => !!u)),
      );
      const { error } = await admin
        .from("profiles")
        .update({ username: candidate })
        .eq("id", p.id)
        .is("username", null);
      if (!error) break;
      if (error.code !== "23505") throw new Error(`apelido: ${error.message}`);
    }
  }
}

/** Abre a semana: grupos por divisão e faixa de horas. Devolve false se já estava aberta. */
export async function openWeek(week: string, admin = createAdminClient()): Promise<boolean> {
  const { data: existing } = await admin
    .from("league_weeks")
    .select("week_start")
    .eq("week_start", week)
    .maybeSingle();
  if (existing) return false;

  const { data: people, error } = await admin
    .from("profiles")
    .select("id, username, display_name, league_division")
    .eq("league_opt_in", true);
  if (error) throw new Error(`participantes: ${error.message}`);
  const list = people ?? [];
  await ensureUsernames(admin, list);

  const { start } = weekWindow(week);
  const { data: focus, error: focusError } = await admin.rpc("league_focus_seconds", {
    p_users: list.map((p) => p.id),
    p_from: weekWindow(addDays(week, -14)).start.toISOString(),
    p_to: start.toISOString(),
  });
  if (focusError) throw new Error(`horas: ${focusError.message}`);
  const seconds = new Map((focus ?? []).map((f) => [f.user_id, Number(f.focus_sec)]));

  const participants: Participant[] = list.map((p) => ({
    userId: p.id,
    division: isDivision(p.league_division) ? p.league_division : "bronze",
    hours: weeklyHours(seconds.get(p.id) ?? 0),
  }));
  const groups = planGroups(participants).map((g) => ({
    division: g.division,
    band_min: g.bandMin,
    band_max: g.bandMax,
    members: g.userIds,
  }));

  const { data: opened, error: openError } = await admin.rpc("apply_league_open", {
    p_week: week,
    p_groups: groups as unknown as Json,
  });
  if (openError) throw new Error(`apply_league_open: ${openError.message}`);
  return opened === true;
}

/** Resultado de cada grupo de uma semana (sem gravar). */
export async function weekResults(
  week: string,
  admin = createAdminClient(),
): Promise<GroupResult[]> {
  const { data, error } = await admin.rpc("league_week_xp", { p_week: week });
  if (error) throw new Error(`league_week_xp: ${error.message}`);
  const groups = new Map<string, { division: Division; rows: Standing[] }>();
  for (const row of data ?? []) {
    const g = groups.get(row.group_id) ?? {
      division: isDivision(row.division) ? row.division : "bronze",
      rows: [],
    };
    g.rows.push({
      userId: row.user_id,
      username: row.username,
      xp: row.xp,
      lastXpAt: row.last_xp_at,
    });
    groups.set(row.group_id, g);
  }
  return [...groups.values()].flatMap((g) => closeGroup(g.rows, g.division));
}

/** Fecha a semana: posição final, saída e divisão nova. Devolve false se já estava fechada. */
export async function closeWeek(week: string, admin = createAdminClient()): Promise<boolean> {
  const results = await weekResults(week, admin);
  const { data: closed, error } = await admin.rpc("apply_league_close", {
    p_week: week,
    p_results: results.map((r) => ({
      user_id: r.userId,
      rank: r.rank,
      xp: r.xp,
      outcome: r.outcome,
      division: r.division,
    })) as unknown as Json,
  });
  if (error) throw new Error(`apply_league_close: ${error.message}`);
  return closed === true;
}

export type RolloverReport = { closed: string[]; opened: string | null };

/**
 * Virada da semana: fecha as semanas anteriores ainda abertas e abre a atual.
 * Idempotente (a trava fica em league_weeks): rodar duas vezes não muda nada.
 */
export async function runWeeklyRollover(
  now = new Date(),
  admin = createAdminClient(),
): Promise<RolloverReport> {
  const current = leagueWeek(now);
  const { data: open, error } = await admin
    .from("league_weeks")
    .select("week_start")
    .is("closed_at", null)
    .lt("week_start", current)
    .order("week_start");
  if (error) throw new Error(`semanas abertas: ${error.message}`);

  const closed: string[] = [];
  for (const w of open ?? []) {
    if (await closeWeek(w.week_start, admin)) closed.push(w.week_start);
  }
  const opened = (await openWeek(current, admin)) ? current : null;
  return { closed, opened };
}

/**
 * Rede de segurança ao abrir a Liga: se o cron de segunda não rodou (ou atrasou),
 * faz a virada agora. Não abre a primeira Feira sozinha: sem semana anterior, nada muda.
 */
export async function ensureLeagueRollover(now = new Date()): Promise<void> {
  const admin = createAdminClient();
  const current = leagueWeek(now);
  const [{ data: unclosed }, { data: latest }] = await Promise.all([
    admin
      .from("league_weeks")
      .select("week_start")
      .is("closed_at", null)
      .lt("week_start", current)
      .limit(1),
    admin
      .from("league_weeks")
      .select("week_start")
      .order("week_start", { ascending: false })
      .limit(1),
  ]);
  const behind = latest?.[0] && latest[0].week_start < current;
  if ((unclosed && unclosed.length > 0) || behind) await runWeeklyRollover(now, admin);
}

/** Sair da Feira tira a pessoa do grupo da semana em andamento (DECISOES 11/11). */
export async function leaveCurrentGroup(userId: string, now = new Date()): Promise<void> {
  const admin = createAdminClient();
  const week = leagueWeek(now);
  const { data: w } = await admin
    .from("league_weeks")
    .select("closed_at")
    .eq("week_start", week)
    .maybeSingle();
  if (!w || w.closed_at) return;
  await admin.from("league_members").delete().eq("user_id", userId).eq("week_start", week);
}
