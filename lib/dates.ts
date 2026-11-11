/** Datas no fuso do usuário (`profiles.timezone`). Dias são strings AAAA-MM-DD. */

/** Dia local de um instante no fuso dado. */
export function localDay(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

function toUtc(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Dias de `from` até `to` (positivo se `to` vem depois). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function addDays(day: string, n: number): string {
  return new Date(toUtc(day) + n * 86_400_000).toISOString().slice(0, 10);
}
