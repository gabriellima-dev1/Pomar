/**
 * Colheita da semana (DESIGN.md §6.5): semana de segunda a domingo no fuso do usuário,
 * contando os dias com emblema. 3–4 dias = Bronze, 5–6 = Prata, 7 = Ouro.
 * A colheita sai assim que a faixa é atingida e só sobe (decisão da dupla, Fase 3).
 */

export const TIERS = ["bronze", "prata", "ouro"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABEL: Record<Tier, string> = { bronze: "Bronze", prata: "Prata", ouro: "Ouro" };

/** Dias com emblema em que cada faixa começa. */
export const TIER_DAYS: Record<Tier, number> = { bronze: 3, prata: 5, ouro: 7 };

export function tierForDays(days: number): Tier | null {
  if (days >= TIER_DAYS.ouro) return "ouro";
  if (days >= TIER_DAYS.prata) return "prata";
  if (days >= TIER_DAYS.bronze) return "bronze";
  return null;
}

export function tierRank(tier: Tier | null): number {
  return tier ? TIERS.indexOf(tier) + 1 : 0;
}

/** Próxima faixa a alcançar e quantos dias faltam (null = já está no Ouro). */
export function nextTier(days: number): { tier: Tier; missing: number } | null {
  for (const tier of TIERS) {
    if (days < TIER_DAYS[tier]) return { tier, missing: TIER_DAYS[tier] - days };
  }
  return null;
}

/** Temas que uma faixa desbloqueia: Prata (ou melhor) → Halloween; Ouro → Natal (§6.7). */
export function themesUnlockedBy(tier: Tier | null): ("halloween" | "natal")[] {
  if (tier === "ouro") return ["halloween", "natal"];
  if (tier === "prata") return ["halloween"];
  return [];
}
