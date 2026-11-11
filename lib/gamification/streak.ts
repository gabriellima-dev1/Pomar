/**
 * Ofensiva e congelamentos (DESIGN.md §6.3), no fuso do usuário.
 * Um dia conta se teve ≥ 1 pomodoro concluído. A cada 7 dias de ofensiva o usuário
 * ganha 1 congelamento (no máximo 2), usado automaticamente num dia sem estudo.
 */

export const FREEZE_EVERY = 7;
export const MAX_FREEZES = 2;

export type StreakState = { current: number; best: number; freezes: number };

export type DayOutcome = "studied" | "frozen" | "reset" | "idle";

export function applyDay(
  state: StreakState,
  studied: boolean,
): { state: StreakState; outcome: DayOutcome } {
  if (studied) {
    const current = state.current + 1;
    const earned = current % FREEZE_EVERY === 0 ? 1 : 0;
    return {
      state: {
        current,
        best: Math.max(state.best, current),
        freezes: Math.min(MAX_FREEZES, state.freezes + earned),
      },
      outcome: "studied",
    };
  }
  // Sem ofensiva não há o que proteger: o congelamento fica guardado.
  if (state.current === 0) return { state, outcome: "idle" };
  if (state.freezes > 0) {
    return { state: { ...state, freezes: state.freezes - 1 }, outcome: "frozen" };
  }
  return { state: { ...state, current: 0 }, outcome: "reset" };
}

/** Ofensiva mostrada: os dias já fechados + hoje, se hoje já tem pomodoro. */
export function displayStreak(closedStreak: number, studiedToday: boolean): number {
  return closedStreak + (studiedToday ? 1 : 0);
}

/**
 * Um congelamento foi usado ontem? Se ontem não teve estudo e a ofensiva continua
 * acima de zero, só pode ter sido o congelamento (senão ela teria zerado).
 */
export function freezeUsedYesterday(
  closedStreak: number,
  studiedYesterday: boolean,
  yesterdayClosed: boolean,
): boolean {
  return yesterdayClosed && !studiedYesterday && closedStreak > 0;
}
