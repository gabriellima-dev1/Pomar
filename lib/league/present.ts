/**
 * Apresentação da Feira (telas.md › 23 e 25): janela de linhas em volta da pessoa,
 * divisórias de zona e textos do resultado da semana (sem "rebaixado" nem "perdeu").
 */
import { DIVISION_LABEL, type Division } from "./divisions";
import { zones, type Outcome } from "./ranking";

export const VISIBLE_ROWS = 8;

/** Índices [início, fim) das até 8 linhas mostradas em volta da pessoa. */
export function visibleWindow(size: number, meIndex: number, max = VISIBLE_ROWS): [number, number] {
  if (size <= max) return [0, size];
  const start = Math.min(Math.max(0, meIndex - Math.floor((max - 1) / 2)), size - max);
  return [start, start + max];
}

export type Divider = { kind: "up" | "down"; text: string };

/**
 * Divisória que vem logo DEPOIS da posição `rank` (1-based), se houver:
 * "SOBEM PARA A FEIRA DE OURO" depois do 5º e "DESCEM PARA A FEIRA DE BRONZE"
 * antes dos 5 últimos.
 */
export function dividerAfter(
  rank: number,
  size: number,
  division: Division,
  next: Division | null,
  previous: Division | null,
): Divider | null {
  const z = zones(size, division);
  if (z.up > 0 && rank === z.up && next) {
    return { kind: "up", text: `Sobem para a Feira de ${DIVISION_LABEL[next]}` };
  }
  if (z.down > 0 && rank === size - z.down && previous) {
    return { kind: "down", text: `Descem para a Feira de ${DIVISION_LABEL[previous]}` };
  }
  return null;
}

export type WeekResultCopy = { badge: string; title: string; body: string; celebrate: boolean };

/** Textos da tela 25 por caso (subiu, ficou, desceu). */
export function weekResultCopy(r: {
  outcome: Outcome;
  rank: number;
  xp: number;
  from: Division;
  to: Division;
}): WeekResultCopy {
  const place = `${r.rank}º`;
  if (r.outcome === "up") {
    return {
      badge: "Você subiu",
      title: `Feira de ${DIVISION_LABEL[r.to]}!`,
      body: `Você terminou a semana em ${place} lugar na Feira de ${DIVISION_LABEL[r.from]}, com ${r.xp} XP. Na nova Feira, todo mundo começa do zero.`,
      celebrate: true,
    };
  }
  if (r.outcome === "down") {
    return {
      badge: "Nova Feira",
      title: `Nesta semana você vai para a Feira de ${DIVISION_LABEL[r.to]}`,
      body: "Lá os grupos estudam num ritmo parecido com o seu agora.",
      celebrate: false,
    };
  }
  return {
    badge: `${place} lugar`,
    title: `Você continua na Feira de ${DIVISION_LABEL[r.from]}`,
    body: `Terminou em ${place}, com ${r.xp} XP. Semana nova, todo mundo começa do zero.`,
    celebrate: true,
  };
}

/**
 * Frase do destaque do Competidor no Início (DESIGN §6.8): distância para quem está
 * logo acima, ou o aviso de que a pessoa lidera.
 */
export function chaseLine(
  rows: readonly { rank: number; xp: number; username: string | null; isMe: boolean }[],
): string {
  const me = rows.find((r) => r.isMe);
  if (!me) return "";
  const ahead = rows.find((r) => r.rank === me.rank - 1);
  if (!ahead) return rows.length > 1 ? "Você está em 1º lugar no seu grupo." : "";
  const who = ahead.isMe || !ahead.username ? "quem está à frente" : `@${ahead.username}`;
  const gap = ahead.xp - me.xp;
  if (gap <= 0) return `Empate em XP com ${who}.`;
  return `Faltam ${gap} XP para alcançar ${who}.`;
}
