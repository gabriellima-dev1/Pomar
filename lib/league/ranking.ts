/**
 * Ranking e fechamento de um grupo da Feira (DESIGN §6.6, DECISOES 11/11).
 * - Ordem: XP da semana; empate → quem chegou primeiro ao XP (último ganho mais
 *   antigo); depois o apelido.
 * - Zonas só em grupos com 10 ou mais: 5 primeiros sobem, 5 últimos descem.
 *   Bronze não desce; Esmeralda não sobe. Só sobe quem fez XP na semana.
 */
import { nextDivision, previousDivision, type Division } from "./divisions";
import { MIN_FOR_ZONES } from "./grouping";

export const ZONE_SIZE = 5;

export type Outcome = "up" | "stay" | "down";

export type Standing = {
  userId: string;
  username: string | null;
  xp: number;
  /** Instante do último ganho de XP na semana (ISO), ou null sem XP. */
  lastXpAt: string | null;
};

export type RankedStanding<T extends Standing = Standing> = T & { rank: number };

export type GroupResult = {
  userId: string;
  rank: number;
  xp: number;
  outcome: Outcome;
  division: Division;
};

export function rankStandings<T extends Standing>(rows: readonly T[]): RankedStanding<T>[] {
  return [...rows]
    .sort(
      (a, b) =>
        b.xp - a.xp ||
        (a.lastXpAt ?? "￿").localeCompare(b.lastXpAt ?? "￿") ||
        (a.username ?? "").localeCompare(b.username ?? "") ||
        a.userId.localeCompare(b.userId),
    )
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

/** Quantas posições sobem e descem num grupo desse tamanho e divisão. */
export function zones(size: number, division: Division): { up: number; down: number } {
  if (size < MIN_FOR_ZONES) return { up: 0, down: 0 };
  return {
    up: nextDivision(division) ? ZONE_SIZE : 0,
    down: previousDivision(division) ? ZONE_SIZE : 0,
  };
}

export function outcomeFor(rank: number, size: number, division: Division, xp: number): Outcome {
  const z = zones(size, division);
  if (rank <= z.up && xp > 0) return "up";
  if (rank > size - z.down) return "down";
  return "stay";
}

/** Resultado final de um grupo: posição, XP, saída e a divisão da semana seguinte. */
export function closeGroup(rows: readonly Standing[], division: Division): GroupResult[] {
  const ranked = rankStandings(rows);
  return ranked.map((r) => {
    const outcome = outcomeFor(r.rank, ranked.length, division, r.xp);
    const next =
      outcome === "up"
        ? nextDivision(division)
        : outcome === "down"
          ? previousDivision(division)
          : division;
    return { userId: r.userId, rank: r.rank, xp: r.xp, outcome, division: next ?? division };
  });
}
