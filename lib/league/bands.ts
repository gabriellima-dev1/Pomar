/**
 * Faixas de horas semanais da Feira (DESIGN §6.6): `< 3h`, `3–7h`, `7–14h`, `14h+`,
 * pela média das 2 semanas anteriores. Faixas vizinhas podem se juntar num grupo
 * (DECISOES 11/11), por isso um grupo guarda o intervalo [bandMin, bandMax].
 */
export const BAND_LIMITS = [0, 3, 7, 14] as const;

export type BandIndex = 0 | 1 | 2 | 3;

/** Média semanal em horas de quem estudou `focusSec` nas 2 semanas anteriores. */
export function weeklyHours(focusSecTwoWeeks: number): number {
  return Math.max(0, focusSecTwoWeeks) / 2 / 3600;
}

export function bandFor(hours: number): BandIndex {
  if (hours >= 14) return 3;
  if (hours >= 7) return 2;
  if (hours >= 3) return 1;
  return 0;
}

/** "de 3 a 7 h", "menos de 3 h", "14 h ou mais", "de 3 a 14 h"; tudo junto → null. */
export function bandRangeLabel(min: BandIndex, max: BandIndex): string | null {
  if (min === 0 && max === 3) return null;
  if (min === 0) return `menos de ${BAND_LIMITS[max + 1]} h`;
  if (max === 3) return `${BAND_LIMITS[min]} h ou mais`;
  return `de ${BAND_LIMITS[min]} a ${BAND_LIMITS[max + 1]} h`;
}

/** Subtítulo do card da Feira: "14 pessoas que estudam de 3 a 7 h por semana". */
export function groupSubtitle(size: number, min: BandIndex, max: BandIndex): string {
  const people = size === 1 ? "1 pessoa" : `${size} pessoas`;
  const range = bandRangeLabel(min, max);
  if (!range) return `${people} de todos os ritmos de estudo`;
  return `${people} que ${size === 1 ? "estuda" : "estudam"} ${range} por semana`;
}
