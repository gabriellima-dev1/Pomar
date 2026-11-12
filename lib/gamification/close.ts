/**
 * Fechamento "preguiçoso" dos dias (DESIGN.md §6.3–6.5). Quando o usuário abre o app,
 * o servidor fecha todos os dias anteriores ainda abertos: ofensiva e congelamentos,
 * 1 emblema sorteado por dia com pomodoro, colheita da semana e temas desbloqueados.
 * Função pura: os dados chegam prontos e o sorteio usa o `rng` recebido.
 */

import { addDays, dayRange, localDay, weekStart } from "@/lib/dates";
import { drawBadge, eligibleBadges, type DaySession } from "./badges";
import type { BadgeCode } from "./catalog";
import { themesUnlockedBy, tierForDays, tierRank, type Tier } from "./harvest";
import { applyDay, type StreakState } from "./streak";
import type { ThemeCode } from "./themes";

export type SessionRecord = {
  startedAt: string;
  endedAt: string;
  status: "completed" | "cancelled";
  pauses: number;
  subjectId: string | null;
  chapterId: string | null;
};

export type HarvestRecord = { weekStart: string; tier: Tier; days: number };

export type CloseInput = {
  timeZone: string;
  /** Primeiro e último dia a fechar (inclusive). */
  fromDay: string;
  toDay: string;
  streak: StreakState;
  /** Ciclos concluídos de todo o histórico até `toDay` + encerrados dentro do intervalo. */
  sessions: readonly SessionRecord[];
  /** Instantes em que cada capítulo ficou completo (último tópico marcado). */
  chapterCompletions: readonly string[];
  dailyGoals: ReadonlyMap<string, number>;
  /** Dias que já têm emblema (para contar a colheita de semanas já começadas). */
  existingBadgeDays: readonly string[];
  existingHarvests: readonly HarvestRecord[];
  unlockedThemes: ReadonlySet<string>;
  rng: () => number;
};

export type CloseResult = {
  lastClosedDay: string;
  streak: StreakState;
  badges: { day: string; code: BadgeCode }[];
  /** Colheitas novas ou que subiram de faixa (`upgraded`) ou só ganharam dias. */
  harvests: (HarvestRecord & { upgraded: boolean })[];
  themes: { code: ThemeCode; week: string }[];
};

/**
 * Intervalo a fechar: do dia seguinte ao último fechado (ou do 1º dia de uso) até ontem.
 * Devolve null se não houver nada a fechar.
 */
export function daysToClose(input: {
  lastClosedDay: string | null;
  firstDay: string;
  today: string;
}): { fromDay: string; toDay: string } | null {
  const fromDay = input.lastClosedDay ? addDays(input.lastClosedDay, 1) : input.firstDay;
  const toDay = addDays(input.today, -1);
  return fromDay <= toDay ? { fromDay, toDay } : null;
}

function firstDayBy(
  sessions: readonly SessionRecord[],
  key: (s: SessionRecord) => string | null,
  tz: string,
): Map<string, string> {
  const first = new Map<string, string>();
  for (const s of sessions) {
    const k = key(s);
    if (s.status !== "completed" || !k) continue;
    const day = localDay(new Date(s.endedAt), tz);
    const prev = first.get(k);
    if (!prev || day < prev) first.set(k, day);
  }
  return first;
}

export function closeDays(input: CloseInput): CloseResult {
  const tz = input.timeZone;
  const days = dayRange(input.fromDay, input.toDay);

  const byDay = new Map<string, SessionRecord[]>();
  const studyDays = new Set<string>();
  for (const s of input.sessions) {
    const day = localDay(new Date(s.endedAt), tz);
    if (s.status === "completed") studyDays.add(day);
    const list = byDay.get(day) ?? [];
    list.push(s);
    byDay.set(day, list);
  }
  const sortedStudyDays = [...studyDays].sort();
  const firstSubjectDay = firstDayBy(input.sessions, (s) => s.subjectId, tz);
  const firstChapterDay = firstDayBy(input.sessions, (s) => s.chapterId, tz);
  const chapterDays = new Set(input.chapterCompletions.map((t) => localDay(new Date(t), tz)));

  let streak = input.streak;
  const badges: CloseResult["badges"] = [];

  for (const day of days) {
    const list = byDay.get(day) ?? [];
    const done = list.filter((s) => s.status === "completed");
    const studied = done.length > 0;
    streak = applyDay(streak, studied).state;
    if (!studied) continue;

    const previousStudyDay = sortedStudyDays.filter((d) => d < day).at(-1) ?? null;
    const startedSubjectOrChapter = done.some(
      (s) =>
        (s.subjectId !== null && firstSubjectDay.get(s.subjectId) === day) ||
        (s.chapterId !== null && firstChapterDay.get(s.chapterId) === day),
    );
    const sessions: DaySession[] = list.map((s) => ({
      startedAt: new Date(s.startedAt),
      status: s.status,
      pauses: s.pauses,
      subjectId: s.subjectId,
    }));
    const eligible = eligibleBadges({
      day,
      timeZone: tz,
      sessions,
      previousStudyDay,
      startedSubjectOrChapter,
      finishedChapter: chapterDays.has(day),
      dailyGoals: input.dailyGoals,
    });
    badges.push({ day, code: drawBadge(eligible, input.rng) });
  }

  // Colheitas das semanas que ganharam emblema.
  const badgeDays = new Set([...input.existingBadgeDays, ...badges.map((b) => b.day)]);
  const weeks = [...new Set(badges.map((b) => weekStart(b.day)))].sort();
  const existing = new Map(input.existingHarvests.map((h) => [h.weekStart, h]));
  const unlocked = new Set(input.unlockedThemes);
  const harvests: CloseResult["harvests"] = [];
  const themes: CloseResult["themes"] = [];

  for (const week of weeks) {
    const count = dayRange(week, addDays(week, 6)).filter((d) => badgeDays.has(d)).length;
    const tier = tierForDays(count);
    const before = existing.get(week);
    if (!tier || (before && count <= before.days)) continue;
    harvests.push({
      weekStart: week,
      tier,
      days: count,
      upgraded: tierRank(tier) > tierRank(before?.tier ?? null),
    });
    for (const code of themesUnlockedBy(tier)) {
      if (!unlocked.has(code)) {
        unlocked.add(code);
        themes.push({ code, week });
      }
    }
  }

  return { lastClosedDay: input.toDay, streak, badges, harvests, themes };
}

/**
 * Instantes em que cada capítulo ficou completo: o `done_at` mais recente dos
 * capítulos com todos os tópicos marcados (capítulo sem tópicos não conta).
 */
export function chapterCompletionTimes(
  chapters: readonly { topics: readonly { done_at: string | null }[] }[],
): string[] {
  const out: string[] = [];
  for (const c of chapters) {
    if (c.topics.length === 0 || c.topics.some((t) => !t.done_at)) continue;
    out.push(
      c.topics
        .map((t) => t.done_at as string)
        .reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b)),
    );
  }
  return out;
}
