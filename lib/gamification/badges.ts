/**
 * Elegibilidade e sorteio do emblema diário (DESIGN.md §6.4). Um dia com ≥ 1 pomodoro
 * concluído recebe exatamente 1 emblema, sorteado no servidor entre os elegíveis,
 * ponderado pela raridade. A imprevisibilidade está só em qual emblema sai.
 *
 * Interpretações das regras (DECISOES.md, Fase 3): o dia de um pomodoro é o dia local
 * do fim do ciclo; horários usam o início do ciclo no fuso do usuário.
 */

import { daysBetween, localClock } from "@/lib/dates";
import { BADGES, RARITY_WEIGHT, type BadgeCode } from "./catalog";
import { isNearFullMoon } from "./moon";

export type DaySession = {
  startedAt: Date;
  status: "completed" | "cancelled";
  pauses: number;
  subjectId: string | null;
};

export type BadgeContext = {
  day: string;
  timeZone: string;
  /** Ciclos (concluídos e encerrados) que terminaram nesse dia. */
  sessions: DaySession[];
  /** Último dia anterior com pomodoro concluído (null = primeiro dia). */
  previousStudyDay: string | null;
  /** Concluiu o 1º pomodoro de uma disciplina ou de um capítulo nesse dia. */
  startedSubjectOrChapter: boolean;
  /** Um capítulo ficou completo nesse dia. */
  finishedChapter: boolean;
  /** Meta diária de pomodoros por disciplina (só as que têm meta). */
  dailyGoals: ReadonlyMap<string, number>;
};

const EARLY_HOUR = 7;
const LATE_HOUR = 22;
const MARATHON_RUN = 4;
const NO_PAUSE_COUNT = 3;
const RETURN_GAP_DAYS = 3;

function completed(ctx: BadgeContext): DaySession[] {
  return ctx.sessions.filter((s) => s.status === "completed");
}

function startClock(ctx: BadgeContext, s: DaySession) {
  return localClock(s.startedAt, ctx.timeZone);
}

const RULES: Record<BadgeCode, (ctx: BadgeContext) => boolean> = {
  fruto_do_dia: () => true,
  fruto_dourado: () => true,

  madrugador: (ctx) => completed(ctx).some((s) => startClock(ctx, s).hour < EARLY_HOUR),

  coruja: (ctx) => completed(ctx).some((s) => startClock(ctx, s).hour >= LATE_HOUR),

  maratona: (ctx) => {
    const ordered = [...ctx.sessions].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
    let run = 0;
    for (const s of ordered) {
      run = s.status === "completed" ? run + 1 : 0;
      if (run >= MARATHON_RUN) return true;
    }
    return false;
  },

  sem_pausa: (ctx) => completed(ctx).filter((s) => s.pauses === 0).length >= NO_PAUSE_COUNT,

  explorador: (ctx) => ctx.startedSubjectOrChapter,

  finalizador: (ctx) => ctx.finishedChapter,

  constante: (ctx) => {
    const perSubject = new Map<string, number>();
    for (const s of completed(ctx)) {
      if (s.subjectId) perSubject.set(s.subjectId, (perSubject.get(s.subjectId) ?? 0) + 1);
    }
    for (const [subjectId, goal] of ctx.dailyGoals) {
      if ((perSubject.get(subjectId) ?? 0) >= goal) return true;
    }
    return false;
  },

  retorno: (ctx) =>
    ctx.previousStudyDay !== null &&
    daysBetween(ctx.previousStudyDay, ctx.day) - 1 >= RETURN_GAP_DAYS,

  lua_cheia: (ctx) =>
    completed(ctx).some((s) => {
      const { hour } = startClock(ctx, s);
      return (hour >= 18 || hour < 6) && isNearFullMoon(s.startedAt);
    }),
};

/** Emblemas elegíveis no dia, na ordem do §6.4. Vazio se não houve pomodoro concluído. */
export function eligibleBadges(ctx: BadgeContext): BadgeCode[] {
  if (completed(ctx).length === 0) return [];
  return BADGES.filter((b) => RULES[b.code](ctx)).map((b) => b.code);
}

/**
 * Chance fixa do Fruto Dourado por dia com pomodoro (~1 a cada 50 dias). Raro de
 * verdade, como os itens especiais do Duolingo (decisão da dupla, 11/11).
 */
export const GOLDEN_CHANCE = 0.02;

function clamp01(x: number): number {
  return Math.min(Math.max(x, 0), 0.999999999);
}

/**
 * Sorteio do emblema do dia. Primeiro o Fruto Dourado, com chance fixa de 2%; senão,
 * sorteio ponderado pela raridade (comum 10, incomum 5, raro 1) entre os outros
 * elegíveis. `rng` devolve um número em [0, 1) (no servidor, `crypto.getRandomValues`;
 * nos testes, valores fixos).
 */
export function drawBadge(eligible: readonly BadgeCode[], rng: () => number): BadgeCode {
  if (eligible.length === 0) throw new Error("Nenhum emblema elegível.");
  const pool = eligible.filter((code) => code !== "fruto_dourado");
  if (pool.length < eligible.length && (pool.length === 0 || clamp01(rng()) < GOLDEN_CHANCE)) {
    return "fruto_dourado";
  }
  const weights = pool.map((code) => {
    const info = BADGES.find((b) => b.code === code);
    return info ? RARITY_WEIGHT[info.rarity] : 0;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = clamp01(rng()) * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i] ?? 0;
    if (r < 0) return pool[i] as BadgeCode;
  }
  return pool[pool.length - 1] as BadgeCode;
}

/** Número aleatório em [0, 1) com o gerador criptográfico (servidor). */
export function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return (buf[0] ?? 0) / 2 ** 32;
}
