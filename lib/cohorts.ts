/**
 * Teste de dependência (DESIGN.md §9.4): a coorte B não vê XP, emblemas e colheitas
 * (a contagem segue registrada no servidor). A flag `rewards_enabled` controla o
 * experimento: `enabled = false` desliga as recompensas para todos; `rollout.off_for_cohorts`
 * lista as coortes sem recompensas visíveis (padrão: ["B"]).
 */

export type Cohort = "A" | "B";

export type RewardsFlag = { enabled: boolean; rollout: unknown };

export function parseCohort(value: unknown): Cohort | null {
  return value === "A" || value === "B" ? value : null;
}

function offCohorts(rollout: unknown): string[] {
  if (!rollout || typeof rollout !== "object" || Array.isArray(rollout)) return [];
  const list = (rollout as Record<string, unknown>).off_for_cohorts;
  return Array.isArray(list) ? list.filter((c): c is string => typeof c === "string") : [];
}

/**
 * As recompensas aparecem para esta pessoa? Sem flag ou sem coorte (falha no sorteio,
 * contas antigas) = sim, como na coorte A.
 */
export function rewardsEnabled(cohort: Cohort | null, flag: RewardsFlag | null): boolean {
  if (!flag) return true;
  if (!flag.enabled) return false;
  if (!cohort) return true;
  return !offCohorts(flag.rollout).includes(cohort);
}
