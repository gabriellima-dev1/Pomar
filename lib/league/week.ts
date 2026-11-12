/**
 * Semana da Feira: segunda a domingo, fechada às 00:00 de segunda em
 * America/Sao_Paulo (DESIGN §6.6), para todo mundo, independentemente do fuso do perfil.
 */
import { addDays, localDay, weekStart, zonedMidnight } from "@/lib/dates";

export const LEAGUE_TZ = "America/Sao_Paulo";

/** Segunda-feira (AAAA-MM-DD) da semana da Feira em andamento. */
export function leagueWeek(now: Date): string {
  return weekStart(localDay(now, LEAGUE_TZ));
}

/** Instantes de início e fim (exclusivo) de uma semana da Feira. */
export function weekWindow(week: string): { start: Date; end: Date } {
  return { start: zonedMidnight(week, LEAGUE_TZ), end: zonedMidnight(addDays(week, 7), LEAGUE_TZ) };
}

/** Tempo até o fechamento: "4d 6h", "6h", "45min" (nunca negativo). */
export function closesIn(now: Date, week: string): string {
  const ms = Math.max(0, weekWindow(week).end.getTime() - now.getTime());
  const totalMin = Math.floor(ms / 60_000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `${totalMin % 60}min`;
}
