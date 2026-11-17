/**
 * Métricas do painel /admin (DESIGN §9.2–9.4, telas.md › 34). Funções puras: recebem as
 * pessoas e os eventos já lidos do banco e devolvem os números da tela.
 *
 * - Ativo no dia = `pomodoro_completed` ou `topic_completed` no dia local da pessoa.
 * - DAU = média de ativos por dia no período; MAU = ativos nos últimos 30 dias;
 *   stickiness = DAU médio dos últimos 30 dias ÷ MAU.
 * - Retenção D1/D7 = de quem se cadastrou no período e já tem o dia D completo, quantos
 *   ficaram ativos no dia cadastro+1 / cadastro+7.
 * - Funil: cadastro → quiz → 1ª disciplina → calibração → 1º pomodoro → ativo em 3 dias
 *   distintos nos primeiros 7.
 */
import { addDays, dayRange, localDay } from "@/lib/dates";

export type AdminPerson = {
  id: string;
  timezone: string;
  /** Cadastro (ISO). */
  createdAt: string;
  isDemo: boolean;
  cohort: "A" | "B" | null;
  /** No experimento = tem coorte e não saiu. */
  inExperiment: boolean;
};

export type AdminEvent = {
  userId: string | null;
  name: string;
  /** ISO */
  at: string;
  /** `pause_nudge_choice`: "restart" | "continue". */
  choice?: string | null;
};

export type Period = 7 | 30 | "tudo";

export type FunnelStep = {
  label: string;
  count: number;
  /** perda (0–1) sobre a etapa anterior */ drop: number | null;
};

export type CohortRow = {
  people: number;
  dauAvg: number;
  pomodorosPerPersonWeek: number;
  retentionD7: number | null;
};

export type AdminMetrics = {
  days: string[];
  dauAvg: number;
  mau: number;
  stickiness: number | null;
  retentionD1: number | null;
  retentionD7: number | null;
  funnel: FunnelStep[];
  activeByDay: { day: string; count: number }[];
  nudge: { shown: number; restart: number; continue: number; acceptance: number | null };
  cohorts: { A: CohortRow; B: CohortRow };
  demoAccounts: number;
};

/** Fuso usado para o calendário do painel (o padrão do app). */
export const PANEL_TZ = "America/Maceio";

const ACTIVE = new Set(["pomodoro_completed", "topic_completed"]);

function round(n: number, digits = 1): number {
  const k = 10 ** digits;
  return Math.round(n * k) / k;
}

/** Dias (AAAA-MM-DD) do período no calendário do painel, do mais antigo para hoje. */
export function periodDays(period: Period, today: string, firstDay: string): string[] {
  if (period === "tudo") {
    const start = firstDay < today ? firstDay : today;
    return dayRange(start, today);
  }
  return dayRange(addDays(today, -(period - 1)), today);
}

/** Dias ativos de cada pessoa (no fuso dela). */
export function activeDays(
  events: AdminEvent[],
  people: Map<string, AdminPerson>,
): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const e of events) {
    if (!e.userId || !ACTIVE.has(e.name)) continue;
    const p = people.get(e.userId);
    if (!p) continue;
    const day = localDay(new Date(e.at), p.timezone);
    let set = out.get(p.id);
    if (!set) out.set(p.id, (set = new Set()));
    set.add(day);
  }
  return out;
}

function dauSeries(days: string[], active: Map<string, Set<string>>, ids?: Set<string>) {
  return days.map((day) => {
    let count = 0;
    for (const [id, set] of active) if ((!ids || ids.has(id)) && set.has(day)) count++;
    return { day, count };
  });
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

/** Retenção do dia D entre quem se cadastrou nos `days` e já tem o dia D completo. */
function retention(
  persons: AdminPerson[],
  active: Map<string, Set<string>>,
  offset: number,
  days: string[],
  today: string,
): number | null {
  const window = new Set(days);
  let base = 0;
  let kept = 0;
  for (const p of persons) {
    const signup = localDay(new Date(p.createdAt), p.timezone);
    if (!window.has(signup)) continue;
    const target = addDays(signup, offset);
    if (target >= today) continue; // o dia D ainda não terminou
    base++;
    if (active.get(p.id)?.has(target)) kept++;
  }
  return base === 0 ? null : kept / base;
}

export function computeAdminMetrics(input: {
  people: AdminPerson[];
  events: AdminEvent[];
  period: Period;
  excludeDemo: boolean;
  now: Date;
}): AdminMetrics {
  const { period, excludeDemo, now } = input;
  const demoAccounts = input.people.filter((p) => p.isDemo).length;
  const persons = input.people.filter((p) => !(excludeDemo && p.isDemo));
  const byId = new Map(persons.map((p) => [p.id, p]));
  const events = input.events.filter((e) => e.userId === null || byId.has(e.userId));
  const userEvents = events.filter((e) => e.userId !== null && byId.has(e.userId));

  const today = localDay(now, PANEL_TZ);
  const firstDay = persons.reduce((min, p) => {
    const d = localDay(new Date(p.createdAt), PANEL_TZ);
    return d < min ? d : min;
  }, today);
  const days = periodDays(period, today, firstDay);
  const window = new Set(days);
  const active = activeDays(userEvents, byId);

  // DAU, MAU, stickiness
  const series = dauSeries(days, active);
  const dauAvg = mean(series.map((s) => s.count));
  const last30 = dayRange(addDays(today, -29), today);
  const last30Set = new Set(last30);
  let mau = 0;
  for (const set of active.values()) if ([...set].some((d) => last30Set.has(d))) mau++;
  const dau30 = mean(dauSeries(last30, active).map((s) => s.count));

  // Funil (base: cadastros no período)
  const signups = persons.filter((p) => window.has(localDay(new Date(p.createdAt), p.timezone)));
  const has = (name: string) => {
    const ids = new Set<string>();
    for (const e of userEvents) if (e.name === name) ids.add(e.userId!);
    return ids;
  };
  const quiz = has("onboarding_quiz_completed");
  const subject = has("subject_created");
  const calibration = has("calibration_completed");
  const pomodoro = has("pomodoro_completed");
  const steps: [string, (p: AdminPerson) => boolean][] = [
    ["Cadastro", () => true],
    ["Quiz respondido", (p) => quiz.has(p.id)],
    ["1ª disciplina", (p) => subject.has(p.id)],
    ["Calibração", (p) => calibration.has(p.id)],
    ["1º pomodoro", (p) => pomodoro.has(p.id)],
    [
      "Ativo em 3 dias",
      (p) => {
        const signup = localDay(new Date(p.createdAt), p.timezone);
        const last = addDays(signup, 6);
        const set = active.get(p.id);
        if (!set) return false;
        return [...set].filter((d) => d >= signup && d <= last).length >= 3;
      },
    ],
  ];
  let remaining = signups;
  const funnel: FunnelStep[] = steps.map(([label, test], i) => {
    const before = remaining.length;
    remaining = remaining.filter(test);
    return {
      label,
      count: remaining.length,
      drop: i === 0 || before === 0 ? null : 1 - remaining.length / before,
    };
  });

  // Nudge da pausa no período
  const inWindow = (e: AdminEvent) => window.has(localDay(new Date(e.at), PANEL_TZ));
  let shown = 0;
  let restart = 0;
  let cont = 0;
  for (const e of userEvents) {
    if (!inWindow(e)) continue;
    if (e.name === "pause_nudge_shown") shown++;
    if (e.name === "pause_nudge_choice" && e.choice === "restart") restart++;
    if (e.name === "pause_nudge_choice" && e.choice === "continue") cont++;
  }

  // Experimento A × B (só quem está no experimento)
  const weeks = Math.max(1, days.length / 7);
  const cohortRow = (c: "A" | "B"): CohortRow => {
    const members = persons.filter((p) => p.inExperiment && p.cohort === c);
    const ids = new Set(members.map((p) => p.id));
    const pomodoros = userEvents.filter(
      (e) => e.name === "pomodoro_completed" && ids.has(e.userId!) && inWindow(e),
    ).length;
    return {
      people: members.length,
      dauAvg: round(mean(dauSeries(days, active, ids).map((s) => s.count))),
      pomodorosPerPersonWeek: members.length === 0 ? 0 : round(pomodoros / members.length / weeks),
      retentionD7: retention(members, active, 7, days, today),
    };
  };

  return {
    days,
    dauAvg: round(dauAvg),
    mau,
    stickiness: mau === 0 ? null : dau30 / mau,
    retentionD1: retention(persons, active, 1, days, today),
    retentionD7: retention(persons, active, 7, days, today),
    funnel,
    activeByDay: series,
    nudge: { shown, restart, continue: cont, acceptance: shown === 0 ? null : restart / shown },
    cohorts: { A: cohortRow("A"), B: cohortRow("B") },
    demoAccounts,
  };
}

/** "44%" (ou "—"). */
export function pct(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}

/** Diferença B → A para a tabela: relativa ("+31%") ou em pontos ("+9 p.p."). */
export function diffLabel(a: number | null, b: number | null, kind: "relative" | "points"): string {
  if (a === null || b === null) return "—";
  if (kind === "points") {
    const pp = Math.round((a - b) * 100);
    return `${pp > 0 ? "+" : ""}${pp} p.p.`;
  }
  if (b === 0) return "—";
  const rel = Math.round(((a - b) / b) * 100);
  return `${rel > 0 ? "+" : ""}${rel}%`;
}
