/**
 * Fase da lua por aproximação (lunação média), sem dependências. Erro típico de
 * algumas horas — suficiente para o emblema "Lua Cheia" (DESIGN.md §6.4), que aceita
 * uma janela de ±1 dia em torno da cheia.
 */

export const SYNODIC_MONTH_DAYS = 29.530588853;
/** Lua nova de referência: 6/1/2000 18:14 UTC. */
const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

/** Idade da lua em dias desde a última lua nova (0 a 29,53). */
export function moonAge(instant: Date): number {
  const days = (instant.getTime() - NEW_MOON_EPOCH_MS) / DAY_MS;
  const age = days % SYNODIC_MONTH_DAYS;
  return age < 0 ? age + SYNODIC_MONTH_DAYS : age;
}

/** A lua está a no máximo `windowDays` da cheia. */
export function isNearFullMoon(instant: Date, windowDays = 1): boolean {
  return Math.abs(moonAge(instant) - SYNODIC_MONTH_DAYS / 2) <= windowDays;
}
