/**
 * Motor do pomodoro (DESIGN.md §4.5). Funções puras, sem relógio próprio:
 * o tempo vem sempre de timestamps (`now` em ms), então o cronômetro
 * continua certo com a aba oculta e sobrevive a um recarregamento
 * (estado serializado no localStorage + sessão no banco).
 */

export const TIMER_VERSION = 1;

/** Um pomodoro só conta com pelo menos 90% do foco planejado (DESIGN §6.1). */
export const COMPLETION_RATIO = 0.9;

/** Descanso longo a cada 4 ciclos de foco. */
export const LONG_BREAK_EVERY = 4;

export const MINUTE_STEP = 5;

export const LIMITS = {
  focus: { min: 15, max: 60 },
  short_break: { min: 5, max: 30 },
  long_break: { min: 10, max: 30 },
} as const;

export type Phase = keyof typeof LIMITS;
export type TimerStatus = "ready" | "running" | "paused" | "finished";

export type TimerState = {
  v: typeof TIMER_VERSION;
  phase: Phase;
  status: TimerStatus;
  plannedSec: number;
  /** Início da fase (ms). `null` enquanto `ready`. */
  startedAt: number | null;
  /** Início da pausa atual (ms), só quando `paused`. */
  pausedAt: number | null;
  /** Soma das pausas já encerradas (ms). */
  pausedMs: number;
  pauses: number;
  /** Sessão em `pomodoro_sessions` (só nas fases de foco). */
  sessionId: string | null;
  subjectId: string | null;
  topicId: string | null;
  /** Ciclos de foco concluídos desde o último descanso longo. */
  cyclesDone: number;
  /** Dia local (AAAA-MM-DD) da contagem de ciclos: zera na virada do dia. */
  day: string;
};

export type TimerContext = Pick<TimerState, "subjectId" | "topicId" | "cyclesDone" | "day">;

/** Fase pronta para começar. */
export function readyState(phase: Phase, minutes: number, ctx: TimerContext): TimerState {
  return {
    v: TIMER_VERSION,
    phase,
    status: "ready",
    plannedSec: clampMinutes(phase, minutes) * 60,
    startedAt: null,
    pausedAt: null,
    pausedMs: 0,
    pauses: 0,
    sessionId: null,
    ...ctx,
  };
}

export function start(state: TimerState, now: number, sessionId: string | null = null): TimerState {
  if (state.status !== "ready") return state;
  return { ...state, status: "running", startedAt: now, sessionId };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== "running") return state;
  return { ...state, status: "paused", pausedAt: now, pauses: state.pauses + 1 };
}

export function resume(state: TimerState, now: number): TimerState {
  if (state.status !== "paused" || state.pausedAt === null) return state;
  return {
    ...state,
    status: "running",
    pausedMs: state.pausedMs + Math.max(0, now - state.pausedAt),
    pausedAt: null,
  };
}

/** Marca a fase como encerrada (o tempo efetivo fica congelado no planejado). */
export function finish(state: TimerState): TimerState {
  if (state.status !== "running" && state.status !== "paused") return state;
  return { ...state, status: "finished" };
}

/** Tempo efetivo (sem pausas) em ms, limitado ao planejado. */
export function elapsedMs(state: TimerState, now: number): number {
  const planned = state.plannedSec * 1000;
  if (state.status === "finished") return planned;
  if (state.startedAt === null) return 0;
  const end = state.status === "paused" && state.pausedAt !== null ? state.pausedAt : now;
  return Math.min(planned, Math.max(0, end - state.startedAt - state.pausedMs));
}

/** Segundos que faltam, arredondando para cima (mostra 25:00 no início e 00:00 só no fim). */
export function remainingSec(state: TimerState, now: number): number {
  return Math.max(0, Math.ceil((state.plannedSec * 1000 - elapsedMs(state, now)) / 1000));
}

/** Progresso da fase de 0 a 1. */
export function progress(state: TimerState, now: number): number {
  if (state.plannedSec <= 0) return 0;
  return elapsedMs(state, now) / (state.plannedSec * 1000);
}

/** O tempo da fase acabou (mesmo que a aba estivesse oculta). */
export function isTimeUp(state: TimerState, now: number): boolean {
  return state.status === "running" && remainingSec(state, now) === 0;
}

/** Regra dos 90% (a mesma conferida no servidor, em `complete_pomodoro`). */
export function countsAsCompleted(effectiveSec: number, plannedSec: number): boolean {
  return plannedSec > 0 && effectiveSec >= COMPLETION_RATIO * plannedSec;
}

/** Descanso depois de concluir o ciclo de foco nº `cyclesDone` (1, 2, 3, 4…). */
export function breakAfter(cyclesDone: number): "short_break" | "long_break" {
  return cyclesDone > 0 && cyclesDone % LONG_BREAK_EVERY === 0 ? "long_break" : "short_break";
}

/** Contagem de ciclos para o próximo foco: zera depois do descanso longo ou na virada do dia. */
export function nextCycles(
  state: Pick<TimerState, "phase" | "cyclesDone" | "day">,
  today: string,
): number {
  if (state.day !== today) return 0;
  if (state.phase === "long_break") return 0;
  return state.cyclesDone;
}

export function clampMinutes(phase: Phase, minutes: number): number {
  const { min, max } = LIMITS[phase];
  const stepped = Math.round(minutes / MINUTE_STEP) * MINUTE_STEP;
  return Math.min(max, Math.max(min, Number.isFinite(stepped) ? stepped : min));
}

/** Botões −5/+5, respeitando os limites (DESIGN §4.5). */
export function stepMinutes(phase: Phase, minutes: number, direction: 1 | -1): number {
  return clampMinutes(phase, clampMinutes(phase, minutes) + direction * MINUTE_STEP);
}

// Persistência -----------------------------------------------------------------

export const STORAGE_KEY = "pomar:timer";

export function serialize(state: TimerState): string {
  return JSON.stringify(state);
}

const PHASES = new Set<string>(Object.keys(LIMITS));
const STATUSES = new Set<string>(["ready", "running", "paused", "finished"]);

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isNumOrNull(v: unknown): v is number | null {
  return v === null || isNum(v);
}
function isStrOrNull(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

/** Lê o estado salvo; qualquer coisa estranha (versão antiga, JSON quebrado) vira `null`. */
export function deserialize(raw: string | null): TimerState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const s = data as Record<string, unknown>;
  const valid =
    s.v === TIMER_VERSION &&
    typeof s.phase === "string" &&
    PHASES.has(s.phase) &&
    typeof s.status === "string" &&
    STATUSES.has(s.status) &&
    isNum(s.plannedSec) &&
    s.plannedSec > 0 &&
    isNumOrNull(s.startedAt) &&
    isNumOrNull(s.pausedAt) &&
    isNum(s.pausedMs) &&
    s.pausedMs >= 0 &&
    isNum(s.pauses) &&
    isStrOrNull(s.sessionId) &&
    isStrOrNull(s.subjectId) &&
    isStrOrNull(s.topicId) &&
    isNum(s.cyclesDone) &&
    typeof s.day === "string" &&
    (s.status === "ready" || s.startedAt !== null) &&
    (s.status !== "paused" || s.pausedAt !== null);
  return valid ? (s as TimerState) : null;
}

/** "18:42". */
export function formatTimer(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
