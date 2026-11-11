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
  /** Horário do lembrete ("HH:MM" ou "HH:MM:SS"), se houver. */
  reminderTime: string | null;
};

const EARLY_HOUR = 7;
const LATE_HOUR = 22;
const MARATHON_RUN = 4;
const NO_PAUSE_COUNT = 3;
const PUNCTUAL_MIN = 15;
const RETURN_GAP_DAYS = 3;

function completed(ctx: BadgeContext): DaySession[] {
  return ctx.sessions.filter((s) => s.status === "completed");
}

function startClock(ctx: BadgeContext, s: DaySession) {
  return localClock(s.startedAt, ctx.timeZone);
}

function toMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
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

  pontual: (ctx) => {
    const reminder = ctx.reminderTime ? toMinutes(ctx.reminderTime) : null;
    if (reminder === null) return false;
    return completed(ctx).some((s) => {
      const { hour, minute } = startClock(ctx, s);
      const diff = hour * 60 + minute - reminder;
      return diff >= 0 && diff <= PUNCTUAL_MIN;
    });
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
 * Sorteio ponderado (comum 10, incomum 5, raro 1). `rng` devolve um número em [0, 1)
 * (no servidor, `crypto.getRandomValues`; nos testes, um valor fixo).
 */
export function drawBadge(eligible: readonly BadgeCode[], rng: () => number): BadgeCode {
  if (eligible.length === 0) throw new Error("Nenhum emblema elegível.");
  const weights = eligible.map((code) => {
    const info = BADGES.find((b) => b.code === code);
    return info ? RARITY_WEIGHT[info.rarity] : 0;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.min(Math.max(rng(), 0), 0.999999999) * total;
  for (let i = 0; i < eligible.length; i++) {
    r -= weights[i] ?? 0;
    if (r < 0) return eligible[i] as BadgeCode;
  }
  return eligible[eligible.length - 1] as BadgeCode;
}

/** Número aleatório em [0, 1) com o gerador criptográfico (servidor). */
export function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return (buf[0] ?? 0) / 2 ** 32;
}
