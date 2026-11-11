/**
 * Falas do Seu Tomás (DESIGN.md §1, CLAUDE.md › Interface): acolhedoras, em primeira
 * pessoa, nunca culpabilizantes. Funções puras para escolher a fala pelo contexto.
 */

import { TIER_LABEL, nextTier, tierForDays, tierRank } from "@/lib/gamification/harvest";
import { STAGE_PHRASE, type Stage } from "@/lib/gamification/levels";

function days(n: number): string {
  return `${n} ${n === 1 ? "dia" : "dias"}`;
}

/**
 * Próxima meta da colheita (tela 10), sempre no tom de convite.
 * @param badgeDays dias com emblema já fechados nesta semana
 * @param studiedToday hoje já tem pomodoro (o fruto de hoje sai amanhã)
 * @param daysLeft dias que faltam na semana, contando hoje (segunda = 7, domingo = 1)
 */
export function harvestLine(badgeDays: number, studiedToday: boolean, daysLeft: number): string {
  const current = tierForDays(badgeDays);
  if (current === "ouro") return "Colheita de Ouro nesta semana! Que pomar bonito você cuidou.";

  if (studiedToday) {
    const withToday = badgeDays + 1;
    const tier = tierForDays(withToday);
    if (tierRank(tier) > tierRank(current) && tier) {
      return `O fruto de hoje sai amanhã e traz a Colheita de ${TIER_LABEL[tier]}.`;
    }
    const next = nextTier(withToday);
    if (next && next.missing <= daysLeft - 1) {
      return `O fruto de hoje sai amanhã. Depois faltam ${days(next.missing)} para o ${TIER_LABEL[next.tier]}.`;
    }
    return "Fruto de hoje garantido. Amanhã eu te mostro qual saiu!";
  }

  const withToday = badgeDays + 1;
  const tier = tierForDays(withToday);
  if (tier && tierRank(tier) > tierRank(current)) {
    return `Um pomodoro hoje e a Colheita de ${TIER_LABEL[tier]} é sua.`;
  }
  const next = nextTier(withToday);
  if (next && next.missing <= daysLeft - 1) {
    return `Um pomodoro hoje e você fica a ${days(next.missing)} do ${TIER_LABEL[next.tier]}.`;
  }
  return "Cada dia com pomodoro vira um fruto no cesto. Que tal colher o de hoje?";
}

/** Subiu de estágio (tela 13). */
export function levelUpLine(stage: Stage): string {
  if (stage === "arbusto")
    return "Olha só, a muda virou arbusto! Cada pomodoro seu é uma folha nova.";
  if (stage === "frondosa") return "Que árvore frondosa! Esse pomar é fruto da sua constância.";
  return "Olha só como ela cresceu! Cada pomodoro seu virou um galho novo.";
}

/** Gênero gramatical de cada estágio ("a muda", "o arbusto", "a árvore …"). */
const FEMININE: Record<Stage, boolean> = {
  muda: true,
  arbusto: false,
  jovem: true,
  adulta: true,
  frondosa: true,
};

/** "Seu arbusto virou uma árvore jovem" (tela 13). */
export function stageChangePhrase(from: Stage, to: Stage): string {
  const subject = `${FEMININE[from] ? "Sua" : "Seu"} ${STAGE_PHRASE[from]}`;
  return `${subject} virou ${FEMININE[to] ? "uma" : "um"} ${STAGE_PHRASE[to]}`;
}

/** Fala do Início ao voltar depois de uns dias, ou quando um congelamento salvou a ofensiva. */
export function homeLine(input: {
  /** Dias sem pomodoro antes de hoje (0 = estudou ontem). */
  daysAway: number;
  freezeUsed: boolean;
  streak: number;
}): string | null {
  if (input.daysAway >= 3) {
    return "Que bom te ver de novo! Seu pomar te esperou. Que tal um pomodoro curtinho para recomeçar?";
  }
  if (input.freezeUsed && input.streak > 0) {
    return `Usei um congelamento para guardar sua ofensiva de ${days(input.streak)}. Hoje é um ótimo dia para continuar!`;
  }
  return null;
}

/** Álbum ainda vazio. */
export const EMPTY_ALBUM_LINE =
  "Termine um pomodoro hoje e amanhã eu te mostro o primeiro fruto do seu álbum.";

/** Falas do onboarding (as telas são da Fase 4). */
export const ONBOARDING_LINES = {
  welcome: "Oi! Eu sou o Seu Tomás. Vou te ajudar a transformar estudo em frutos.",
  quiz: "Não existe resposta certa. Escolha a que mais tem a ver com você.",
  calibrate:
    "Abra o livro, aperte o play e leia normalmente. Com isso eu estimo quanto falta para terminar.",
  firstFruit: "Seu pomar começou. Amanhã sai o seu primeiro fruto do dia.",
} as const;
