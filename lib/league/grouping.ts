/**
 * Montagem dos grupos da semana (DESIGN §6.6 + DECISOES 11/11):
 * - mesma divisão;
 * - faixas de horas vizinhas se juntam até o bloco ter ao menos 10 pessoas
 *   (a sobra com menos de 10 vai para o bloco anterior);
 * - cada bloco vira ceil(n/20) grupos equilibrados, em ordem de horas.
 */
import { bandFor, type BandIndex } from "./bands";
import { DIVISION_CODES, type Division } from "./divisions";

export const GROUP_MAX = 20;
export const MIN_FOR_ZONES = 10;

export type Participant = { userId: string; division: Division; hours: number };

export type PlannedGroup = {
  division: Division;
  bandMin: BandIndex;
  bandMax: BandIndex;
  userIds: string[];
};

type Ranked = Participant & { band: BandIndex };

function byHours(a: Ranked, b: Ranked): number {
  return a.hours - b.hours || a.userId.localeCompare(b.userId);
}

/** Junta faixas vizinhas (em ordem crescente) até cada bloco ter `MIN_FOR_ZONES`. */
export function mergeBands(people: readonly Ranked[]): Ranked[][] {
  const blocks: Ranked[][] = [];
  let current: Ranked[] = [];
  for (const band of [0, 1, 2, 3] as const) {
    current.push(...people.filter((p) => p.band === band));
    if (current.length >= MIN_FOR_ZONES) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    const last = blocks.at(-1);
    if (last) last.push(...current);
    else blocks.push(current);
  }
  return blocks;
}

/** Divide `n` em `k` partes que diferem no máximo em 1 (as maiores primeiro). */
export function balancedSizes(n: number, k: number): number[] {
  const base = Math.floor(n / k);
  const extra = n % k;
  return Array.from({ length: k }, (_, i) => base + (i < extra ? 1 : 0));
}

export function planGroups(participants: readonly Participant[]): PlannedGroup[] {
  const groups: PlannedGroup[] = [];
  for (const division of DIVISION_CODES) {
    const people = participants
      .filter((p) => p.division === division)
      .map((p): Ranked => ({ ...p, band: bandFor(p.hours) }));
    for (const block of mergeBands(people)) {
      const sorted = [...block].sort(byHours);
      let offset = 0;
      for (const size of balancedSizes(sorted.length, Math.ceil(sorted.length / GROUP_MAX))) {
        const slice = sorted.slice(offset, offset + size);
        offset += size;
        const bands = slice.map((p) => p.band);
        groups.push({
          division,
          bandMin: Math.min(...bands) as BandIndex,
          bandMax: Math.max(...bands) as BandIndex,
          userIds: slice.map((p) => p.userId),
        });
      }
    }
  }
  return groups;
}
