/**
 * Estatísticas pessoais (DESIGN §4.6, telas.md › 29, DECISOES 11/11). Funções puras:
 * tudo no fuso do usuário e só com ciclos concluídos. Iguais para as duas coortes.
 */
import { addDays, dayRange, localClock, localDay, weekStart } from "@/lib/dates";
import { effectivePace, topicMinutes, type EstimateTopic } from "@/lib/estimates";
import { observedPace } from "@/lib/pace";

export type StatSession = {
  started_at: string;
  ended_at: string;
  paused_sec: number;
  pauses: number;
  subject_id: string | null;
  topic_id: string | null;
  pages_logged: number | null;
};

export type PeriodKind = "semana" | "mes" | "ano";

export type Period = {
  kind: PeriodKind;
  /** Primeiro e último dia (inclusive). */
  start: string;
  end: string;
};

const MONTHS_FULL = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const MONTH_LETTER = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const WEEKDAY_LETTER = ["S", "T", "Q", "Q", "S", "S", "D"];

/** Minutos de foco de um ciclo (mesma conta de lib/focus-summary.ts). */
export function focusMinutes(
  s: Pick<StatSession, "started_at" | "ended_at" | "paused_sec">,
): number {
  return Math.max(
    0,
    (Date.parse(s.ended_at) - Date.parse(s.started_at)) / 60_000 - s.paused_sec / 60,
  );
}

export function isPeriodKind(v: unknown): v is PeriodKind {
  return v === "semana" || v === "mes" || v === "ano";
}

function lastDayOfMonth(y: number, m: number): string {
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

/** Período que contém o dia. */
export function periodFor(kind: PeriodKind, day: string): Period {
  const y = Number(day.slice(0, 4));
  const m = Number(day.slice(5, 7));
  if (kind === "semana") {
    const start = weekStart(day);
    return { kind, start, end: addDays(start, 6) };
  }
  if (kind === "mes") {
    return { kind, start: `${day.slice(0, 7)}-01`, end: lastDayOfMonth(y, m) };
  }
  return { kind, start: `${y}-01-01`, end: `${y}-12-31` };
}

/** Período anterior (-1) ou seguinte (+1). */
export function shiftPeriod(p: Period, dir: -1 | 1): Period {
  if (p.kind === "semana") return periodFor("semana", addDays(p.start, 7 * dir));
  if (p.kind === "mes") {
    const y = Number(p.start.slice(0, 4));
    const m = Number(p.start.slice(5, 7)) - 1 + dir;
    const d = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
    return periodFor("mes", d);
  }
  return periodFor("ano", `${Number(p.start.slice(0, 4)) + dir}-01-01`);
}

/** "2 a 8 de novembro" · "30 de novembro a 6 de dezembro" · "novembro de 2026" · "2026". */
export function periodLabel(p: Period): string {
  const [ys, ms, ds] = p.start.split("-").map(Number) as [number, number, number];
  const [ye, me, de] = p.end.split("-").map(Number) as [number, number, number];
  if (p.kind === "ano") return String(ys);
  if (p.kind === "mes") return `${MONTHS_FULL[ms - 1]} de ${ys}`;
  if (ms === me) return `${ds} a ${de} de ${MONTHS_FULL[me - 1]}`;
  const yearNote = ys !== ye ? ` de ${ys}` : "";
  return `${ds} de ${MONTHS_FULL[ms - 1]}${yearNote} a ${de} de ${MONTHS_FULL[me - 1]}`;
}

function dayOf(s: StatSession, tz: string): string {
  return localDay(new Date(s.ended_at), tz);
}

export function inPeriod(sessions: readonly StatSession[], p: Period, tz: string): StatSession[] {
  return sessions.filter((s) => {
    const d = dayOf(s, tz);
    return d >= p.start && d <= p.end;
  });
}

export type Bar = { key: string; label: string; title: string; minutes: number; future: boolean };

/** Barras: por dia (semana), por semana (mês) ou por mês (ano). */
export function focusBars(
  sessions: readonly StatSession[],
  p: Period,
  tz: string,
  today: string,
): Bar[] {
  const byDay = new Map<string, number>();
  for (const s of inPeriod(sessions, p, tz)) {
    const d = dayOf(s, tz);
    byDay.set(d, (byDay.get(d) ?? 0) + focusMinutes(s));
  }
  const sum = (from: string, to: string) =>
    dayRange(from, to).reduce((a, d) => a + (byDay.get(d) ?? 0), 0);

  if (p.kind === "semana") {
    return dayRange(p.start, p.end).map((d, i) => ({
      key: d,
      label: WEEKDAY_LETTER[i]!,
      title: `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`,
      minutes: Math.round(byDay.get(d) ?? 0),
      future: d > today,
    }));
  }
  if (p.kind === "mes") {
    const bars: Bar[] = [];
    for (let w = weekStart(p.start); w <= p.end; w = addDays(w, 7)) {
      const from = w < p.start ? p.start : w;
      const to = addDays(w, 6) > p.end ? p.end : addDays(w, 6);
      bars.push({
        key: from,
        label: `${Number(from.slice(8))}–${Number(to.slice(8))}`,
        title: `${Number(from.slice(8))} a ${Number(to.slice(8))}`,
        minutes: Math.round(sum(from, to)),
        future: from > today,
      });
    }
    return bars;
  }
  const y = Number(p.start.slice(0, 4));
  return MONTH_LETTER.map((letter, i) => {
    const from = `${y}-${String(i + 1).padStart(2, "0")}-01`;
    return {
      key: from,
      label: letter,
      title: MONTHS_FULL[i]!,
      minutes: Math.round(sum(from, lastDayOfMonth(y, i + 1))),
      future: from > today,
    };
  });
}

export type FocusSummary = {
  totalMin: number;
  previousMin: number;
  pomodoros: number;
  /** % de ciclos sem nenhuma pausa (null sem ciclos). */
  noPausePct: number | null;
  studyDays: number;
};

export function focusSummary(
  sessions: readonly StatSession[],
  p: Period,
  tz: string,
): FocusSummary {
  const now = inPeriod(sessions, p, tz);
  const prev = inPeriod(sessions, shiftPeriod(p, -1), tz);
  const total = (list: StatSession[]) => Math.round(list.reduce((a, s) => a + focusMinutes(s), 0));
  return {
    totalMin: total(now),
    previousMin: total(prev),
    pomodoros: now.length,
    noPausePct: now.length
      ? Math.round((now.filter((s) => s.pauses === 0).length / now.length) * 100)
      : null,
    studyDays: new Set(now.map((s) => dayOf(s, tz))).size,
  };
}

/** "4h 35min", "45min", "2h". */
export function formatHM(min: number): string {
  const total = Math.max(0, Math.round(min));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

/** Comparação neutra com o período anterior: "+40 min que a anterior". */
export function comparisonText(kind: PeriodKind, now: number, prev: number): string {
  const which = kind === "mes" ? "o anterior" : "a anterior";
  const diff = Math.round(now - prev);
  if (diff === 0) return `igual ${kind === "mes" ? "ao anterior" : "à anterior"}`;
  return `${diff > 0 ? "+" : "−"}${formatHM(Math.abs(diff)).replace("min", " min")} que ${which}`;
}

export type HeatTone = 0 | 1 | 2 | 3;

/** 4 tons: 0, < 30 min, 30–60, > 60 (DECISOES 11/11). */
export function heatTone(minutes: number): HeatTone {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes <= 60) return 2;
  return 3;
}

export type HeatCell = { day: string; minutes: number; tone: HeatTone } | null;

/** Semanas (colunas, segunda a domingo) × dias do ano; dias fora do ano ou futuros = null. */
export function yearHeatmap(
  sessions: readonly StatSession[],
  year: number,
  tz: string,
  today: string,
): { weeks: HeatCell[][]; studiedDays: number } {
  const first = `${year}-01-01`;
  const last = `${year}-12-31` < today ? `${year}-12-31` : today;
  const byDay = new Map<string, number>();
  for (const s of sessions) {
    const d = dayOf(s, tz);
    if (d >= first && d <= last) byDay.set(d, (byDay.get(d) ?? 0) + focusMinutes(s));
  }
  const weeks: HeatCell[][] = [];
  if (last < first) return { weeks, studiedDays: 0 };
  for (let w = weekStart(first); w <= last; w = addDays(w, 7)) {
    weeks.push(
      dayRange(w, addDays(w, 6)).map((d) => {
        if (d < first || d > last) return null;
        const minutes = Math.round(byDay.get(d) ?? 0);
        return { day: d, minutes, tone: heatTone(minutes) };
      }),
    );
  }
  return { weeks, studiedDays: [...byDay.values()].filter((m) => m > 0).length };
}

export type SubjectShare = { id: string | null; minutes: number; pct: number };

/** Tempo e % por disciplina no período (maior primeiro; ciclos livres = id null). */
export function bySubject(sessions: readonly StatSession[], p: Period, tz: string): SubjectShare[] {
  const map = new Map<string | null, number>();
  for (const s of inPeriod(sessions, p, tz)) {
    map.set(s.subject_id, (map.get(s.subject_id) ?? 0) + focusMinutes(s));
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  return [...map.entries()]
    .map(([id, minutes]) => ({
      id,
      minutes: Math.round(minutes),
      pct: total ? (minutes / total) * 100 : 0,
    }))
    .filter((x) => x.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

/** Arredonda % para inteiros que somam 100 (maiores restos). */
export function roundedPcts(values: readonly number[]): number[] {
  const floors = values.map(Math.floor);
  let rest = Math.round(values.reduce((a, b) => a + b, 0)) - floors.reduce((a, b) => a + b, 0);
  const order = values.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (rest <= 0) break;
    floors[i]! += 1;
    rest -= 1;
  }
  return floors;
}

export type PacePoint = { at: string; minPerPage: number };

/** min/página por ciclo com páginas registradas, de uma disciplina, em ordem. */
export function paceSeries(
  sessions: readonly StatSession[],
  p: Period,
  tz: string,
  subjectId: string,
): PacePoint[] {
  return inPeriod(sessions, p, tz)
    .filter((s) => s.subject_id === subjectId && (s.pages_logged ?? 0) > 0)
    .sort((a, b) => a.ended_at.localeCompare(b.ended_at))
    .flatMap((s) => {
      const v = observedPace(focusMinutes(s) * 60, s.pages_logged ?? 0);
      return v === null ? [] : [{ at: s.ended_at, minPerPage: v }];
    });
}

/** "Você está lendo cerca de 12% mais rápido do que no começo." (primeiro × último ponto) */
export function paceTrend(points: readonly PacePoint[]): { pct: number; faster: boolean } | null {
  if (points.length < 2) return null;
  const first = points[0]!.minPerPage;
  const last = points.at(-1)!.minPerPage;
  if (!(first > 0)) return null;
  const pct = Math.round((Math.abs(first - last) / first) * 100);
  return { pct, faster: last < first };
}

/** Faixa de 2 h com mais minutos de foco (pela hora de início) nos últimos 30 dias. */
export function bestHours(
  sessions: readonly StatSession[],
  tz: string,
  today: string,
): { hours: number[]; start: number | null; sharePct: number } {
  const from = addDays(today, -29);
  const hours = Array.from({ length: 24 }, () => 0);
  for (const s of sessions) {
    const c = localClock(new Date(s.started_at), tz);
    if (dayOf(s, tz) < from || dayOf(s, tz) > today) continue;
    hours[c.hour]! += focusMinutes(s);
  }
  const total = hours.reduce((a, b) => a + b, 0);
  if (total <= 0) return { hours: hours.map(Math.round), start: null, sharePct: 0 };
  let start = 0;
  for (let h = 1; h < 23; h++) {
    if (hours[h]! + hours[h + 1]! > hours[start]! + hours[start + 1]!) start = h;
  }
  return {
    hours: hours.map(Math.round),
    start,
    sharePct: Math.round(((hours[start]! + hours[start + 1]!) / total) * 100),
  };
}

export type DoneTopic = EstimateTopic & {
  id: string;
  subject_id: string;
  done_at: string;
};

/**
 * Previsto × real: erro médio |real − previsto| ÷ previsto dos tópicos concluídos no
 * período que têm ciclos ligados. Previsto = páginas × ritmo (ou duração ÷ velocidade).
 */
export function predictedVsActual(
  topics: readonly DoneTopic[],
  sessions: readonly StatSession[],
  subjects: ReadonlyMap<string, { minPerPage: number | null; videoSpeed: number }>,
  globalPace: number | null,
  p: Period,
  tz: string,
): { errorPct: number; predictedAvg: number; actualAvg: number; count: number } | null {
  const real = new Map<string, number>();
  for (const s of sessions) {
    if (s.topic_id) real.set(s.topic_id, (real.get(s.topic_id) ?? 0) + focusMinutes(s));
  }
  const pairs = topics.flatMap((t) => {
    const d = localDay(new Date(t.done_at), tz);
    const actual = real.get(t.id);
    if (d < p.start || d > p.end || !actual) return [];
    const subj = subjects.get(t.subject_id);
    const predicted = topicMinutes(
      t,
      effectivePace(subj?.minPerPage ?? null, globalPace).minPerPage,
      subj?.videoSpeed ?? 1,
    );
    return predicted > 0 ? [{ predicted, actual }] : [];
  });
  if (pairs.length === 0) return null;
  const err =
    pairs.reduce((a, x) => a + Math.abs(x.actual - x.predicted) / x.predicted, 0) / pairs.length;
  return {
    errorPct: Math.round(err * 100),
    predictedAvg: pairs.reduce((a, x) => a + x.predicted, 0) / pairs.length,
    actualAvg: pairs.reduce((a, x) => a + x.actual, 0) / pairs.length,
    count: pairs.length,
  };
}
