/** Funções de apresentação da gamificação (telas 01, 09, 10, 12). Puras e testadas. */

import { addDays, daysBetween, weekStart, weekday } from "@/lib/dates";
import { BADGES, type BadgeCode, type BadgeInfo } from "./catalog";
import type { Tier } from "./harvest";

export type BadgeDay = { day: string; code: string };

export type AlbumEntry = BadgeInfo & { count: number; days: string[] };

/** Os 11 emblemas na ordem do álbum, com quantas vezes saíram e em que dias (mais novo primeiro). */
export function albumEntries(history: readonly BadgeDay[]): AlbumEntry[] {
  const byCode = new Map<string, string[]>();
  for (const h of history) byCode.set(h.code, [...(byCode.get(h.code) ?? []), h.day]);
  return BADGES.map((b) => {
    const days = (byCode.get(b.code) ?? []).sort().reverse();
    return { ...b, count: days.length, days };
  });
}

const LETTERS = ["S", "T", "Q", "Q", "S", "S", "D"] as const;
const WEEKDAY_NAMES = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;
const MONTHS = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "maio",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
] as const;

export type WeekDot = {
  day: string;
  letter: string;
  code: BadgeCode | null;
  isToday: boolean;
  isFuture: boolean;
};

/** Os 7 dias (segunda a domingo) da semana de `today`. */
export function weekStrip(today: string, history: readonly BadgeDay[]): WeekDot[] {
  const start = weekStart(today);
  const codes = new Map(history.map((h) => [h.day, h.code as BadgeCode]));
  return LETTERS.map((letter, i) => {
    const day = addDays(start, i);
    return {
      day,
      letter,
      code: codes.get(day) ?? null,
      isToday: day === today,
      isFuture: day > today,
    };
  });
}

/** Dias com emblema na semana de `today`. */
export function badgesThisWeek(today: string, history: readonly BadgeDay[]): number {
  return weekStrip(today, history).filter((d) => d.code).length;
}

function dayMonth(day: string): { d: number; m: number } {
  const [, m, d] = day.split("-").map(Number);
  return { d: d ?? 1, m: (m ?? 1) - 1 };
}

function ordinalDay(d: number): string {
  return d === 1 ? "1º" : String(d);
}

/** "9 a 15 de nov." · "26 de out. a 1º de nov." */
export function weekRangeLabel(start: string): string {
  const a = dayMonth(start);
  const b = dayMonth(addDays(start, 6));
  if (a.m === b.m) return `${ordinalDay(a.d)} a ${ordinalDay(b.d)} de ${MONTHS[b.m]}`;
  return `${ordinalDay(a.d)} de ${MONTHS[a.m]} a ${ordinalDay(b.d)} de ${MONTHS[b.m]}`;
}

/** "segunda, 9 de nov." */
export function dayLabel(day: string): string {
  const { d, m } = dayMonth(day);
  return `${WEEKDAY_NAMES[weekday(day)]}, ${d} de ${MONTHS[m]}`;
}

/** "13 de nov." */
export function shortDate(day: string): string {
  const { d, m } = dayMonth(day);
  return `${ordinalDay(d)} de ${MONTHS[m]}`;
}

/** Título da revelação: "Seu fruto de ontem" ou "Seu fruto de sábado, 7 de nov.". */
export function revealTitle(day: string, today: string): string {
  return daysBetween(day, today) === 1 ? "Seu fruto de ontem" : `Seu fruto de ${dayLabel(day)}`;
}

/** Dias sem pomodoro antes de hoje, pelo último emblema (null = ainda sem emblema). */
export function daysAway(history: readonly BadgeDay[], today: string): number | null {
  const last = [...history]
    .filter((b) => b.day < today)
    .sort((a, b) => a.day.localeCompare(b.day))
    .at(-1);
  return last ? daysBetween(last.day, today) - 1 : null;
}

export type PastWeek = { weekStart: string; tier: Tier | null; days: number };

/**
 * Semanas anteriores (tela 10): colheitas e semanas mais leves, da mais nova para a
 * mais antiga, desde a 1ª semana com emblema (a semana atual fica no card de cima).
 */
export function pastWeeks(
  history: readonly BadgeDay[],
  harvests: readonly { weekStart: string; tier: Tier; days: number }[],
  today: string,
): PastWeek[] {
  const first = [...history].sort((a, b) => a.day.localeCompare(b.day))[0];
  if (!first) return [];
  const byWeek = new Map(harvests.map((h) => [h.weekStart, h]));
  const counts = new Map<string, number>();
  for (const b of history) {
    const w = weekStart(b.day);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const weeks: PastWeek[] = [];
  const oldest = weekStart(first.day);
  for (let w = addDays(weekStart(today), -7); w >= oldest; w = addDays(w, -7)) {
    const h = byWeek.get(w);
    weeks.push({ weekStart: w, tier: h?.tier ?? null, days: h?.days ?? counts.get(w) ?? 0 });
  }
  return weeks;
}
