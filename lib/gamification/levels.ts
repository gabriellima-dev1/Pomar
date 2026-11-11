/** Níveis e estágios da árvore (DESIGN.md §6.2). */

/** XP total para alcançar o nível n: 25 × n × (n − 1). */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return 25 * n * (n - 1);
}

/** Nível correspondente a um XP total. */
export function levelForXp(xp: number): number {
  const total = Math.max(0, Math.floor(xp));
  // Inverso de 25n(n−1) ≤ xp, corrigido para erros de ponto flutuante.
  let n = Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * total) / 25)) / 2));
  while (xpForLevel(n + 1) <= total) n++;
  while (n > 1 && xpForLevel(n) > total) n--;
  return n;
}

export type LevelProgress = {
  level: number;
  /** XP já ganho dentro do nível atual. */
  current: number;
  /** XP do nível atual até o próximo. */
  span: number;
  /** Quanto falta para o próximo nível. */
  remaining: number;
  /** 0 a 1. */
  ratio: number;
};

export function progressToNext(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const span = xpForLevel(level + 1) - base;
  const current = Math.max(0, Math.floor(xp) - base);
  return { level, current, span, remaining: span - current, ratio: current / span };
}

export const STAGES = ["muda", "arbusto", "jovem", "adulta", "frondosa"] as const;
export type Stage = (typeof STAGES)[number];

/** Primeiro nível de cada estágio. */
const STAGE_START: Record<Stage, number> = {
  muda: 1,
  arbusto: 3,
  jovem: 6,
  adulta: 10,
  frondosa: 15,
};

export const STAGE_LABEL: Record<Stage, string> = {
  muda: "Muda",
  arbusto: "Arbusto",
  jovem: "Árvore jovem",
  adulta: "Árvore adulta",
  frondosa: "Árvore frondosa",
};

/** "Seu arbusto virou uma árvore jovem" (tela 13). */
export const STAGE_PHRASE: Record<Stage, string> = {
  muda: "muda",
  arbusto: "arbusto",
  jovem: "árvore jovem",
  adulta: "árvore adulta",
  frondosa: "árvore frondosa",
};

export function stageForLevel(level: number): Stage {
  let stage: Stage = "muda";
  for (const s of STAGES) if (level >= STAGE_START[s]) stage = s;
  return stage;
}

/** Próximo estágio e o nível em que ele chega (null no último). */
export function nextStage(level: number): { stage: Stage; level: number } | null {
  const i = STAGES.indexOf(stageForLevel(level));
  const next = STAGES[i + 1];
  return next ? { stage: next, level: STAGE_START[next] } : null;
}

/**
 * A celebração em tela cheia só aparece quando a árvore muda de estágio
 * (níveis 3, 6, 10 e 15 — DECISOES 10/11); nos outros níveis, um toast.
 */
export function stageChanged(fromLevel: number, toLevel: number): boolean {
  return toLevel > fromLevel && stageForLevel(fromLevel) !== stageForLevel(toLevel);
}
