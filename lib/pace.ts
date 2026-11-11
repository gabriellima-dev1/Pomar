/**
 * Recalibração automática do ritmo (DESIGN.md §4.2). Funções puras; a mesma conta
 * é feita no banco em `log_pomodoro_pages` (supabase/migrations/*_pomodoro.sql).
 *
 * A média móvel começa no ritmo atual: um ciclo fora da curva não basta para
 * sugerir mudança, mas um ritmo diferente que se repete, sim.
 */

export const PACE_ALPHA = 0.3;
export const PACE_DIVERGENCE = 0.2;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Ritmo observado num ciclo (min/página), ou `null` sem páginas. */
export function observedPace(focusSec: number, pages: number): number | null {
  if (!(pages >= 1) || !(focusSec > 0)) return null;
  return round2(focusSec / 60 / pages);
}

/** Próximo valor da média móvel exponencial (α = 0,3), partindo do ritmo atual. */
export function nextEma(previous: number | null, observed: number, currentPace: number): number {
  const base = previous ?? currentPace;
  return round2(PACE_ALPHA * observed + (1 - PACE_ALPHA) * base);
}

/** Sugere atualizar quando a média diverge mais de 20% do ritmo usado nas estimativas. */
export function shouldSuggest(ema: number, currentPace: number): boolean {
  if (!(currentPace > 0)) return false;
  return Math.abs(ema - currentPace) / currentPace > PACE_DIVERGENCE;
}
