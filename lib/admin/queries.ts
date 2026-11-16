import "server-only";
import { experimentGroup, parseCohort } from "@/lib/cohorts";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminEvent, AdminPerson } from "./metrics";

/** Eventos que o painel usa (DESIGN §9.2). */
const PANEL_EVENTS = [
  "signup_completed",
  "onboarding_quiz_completed",
  "subject_created",
  "calibration_completed",
  "pomodoro_completed",
  "topic_completed",
  "pause_nudge_shown",
  "pause_nudge_choice",
] as const;

const PAGE = 1000;

/**
 * Lê pessoas e eventos com a chave secreta (só no servidor, só para admin). O Supabase
 * devolve no máximo 1000 linhas por vez, então lê em páginas.
 */
export async function loadAdminData(): Promise<{ people: AdminPerson[]; events: AdminEvent[] }> {
  const admin = createAdminClient();

  const [{ data: profiles, error: pErr }, { data: cohorts, error: cErr }] = await Promise.all([
    admin.from("profiles").select("id, timezone, created_at, is_demo"),
    admin.from("user_cohorts").select("user_id, cohort, legacy, left_at"),
  ]);
  if (pErr || cErr) throw new Error(`Painel: ${pErr?.message ?? cErr?.message}`);
  const cohortOf = new Map((cohorts ?? []).map((c) => [c.user_id, c]));

  const people: AdminPerson[] = (profiles ?? []).map((p) => {
    const row = cohortOf.get(p.id);
    return {
      id: p.id,
      timezone: p.timezone,
      createdAt: p.created_at,
      isDemo: p.is_demo,
      cohort: parseCohort(row?.cohort),
      inExperiment: experimentGroup(row) !== "fora",
    };
  });

  const events: AdminEvent[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await admin
      .from("telemetry_events")
      .select("user_id, name, props, created_at")
      .in("name", [...PANEL_EVENTS])
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Painel: ${error.message}`);
    for (const e of data ?? []) {
      const props = (e.props ?? {}) as Record<string, unknown>;
      events.push({
        userId: e.user_id,
        name: e.name,
        at: e.created_at,
        choice: typeof props.choice === "string" ? props.choice : null,
      });
    }
    if (!data || data.length < PAGE) break;
  }
  return { people, events };
}
