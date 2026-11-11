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

/** Dia, hora e minuto locais de um instante no fuso dado. */
export function localClock(
  instant: Date,
  timeZone: string,
): { day: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}

/** Dia da semana de um dia AAAA-MM-DD (0 = domingo … 6 = sábado). */
export function weekday(day: string): number {
  return new Date(toUtc(day)).getUTCDay();
}

/** Segunda-feira da semana (segunda a domingo) que contém o dia. */
export function weekStart(day: string): string {
  return addDays(day, -((weekday(day) + 6) % 7));
}

/** Dias de `from` a `to`, inclusive (vazio se `from` vier depois). */
export function dayRange(from: string, to: string): string[] {
  const n = daysBetween(from, to);
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => addDays(from, i));
}
