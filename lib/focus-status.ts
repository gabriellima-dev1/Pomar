/**
 * Estado do item Foco do menu (telas.md › Foco no menu e Início como painel, 39 e 39b).
 * Funções puras: o tempo vem dos timestamps da sessão de foco salva no servidor
 * (`pomodoro_sessions`), então continua certo fora do Foco e com a aba oculta.
 * O descanso não fica no servidor e não aparece no item (DECISOES 17/11).
 */
import type { TimerState } from "./timer";

/** Sessão de foco em andamento (rodando ou pausada), com tempos em ms. */
export type FocusSession = {
  id: string;
  plannedSec: number;
  startedAt: number;
  /** Soma das pausas já encerradas. */
  pausedMs: number;
  /** Início da pausa atual, ou `null` se está rodando. */
  pausedAt: number | null;
};

export type FocusStatus =
  | { kind: "idle" }
  | { kind: "running"; remainingSec: number; progress: number }
  | { kind: "paused"; remainingSec: number; progress: number }
  /** O foco acabou fora do Foco: fruto pronto para colher (39b). */
  | { kind: "harvest" };

/** Linha de `pomodoro_sessions` (status `running`) → sessão do item Foco. */
export function sessionFromRow(row: {
  id: string;
  planned_focus_sec: number;
  started_at: string;
  paused_sec: number;
  paused_at: string | null;
}): FocusSession | null {
  const startedAt = Date.parse(row.started_at);
  if (!Number.isFinite(startedAt) || !(row.planned_focus_sec > 0)) return null;
  const pausedAt = row.paused_at ? Date.parse(row.paused_at) : null;
  return {
    id: row.id,
    plannedSec: row.planned_focus_sec,
    startedAt,
    pausedMs: Math.max(0, row.paused_sec) * 1000,
    pausedAt: pausedAt !== null && Number.isFinite(pausedAt) ? pausedAt : null,
  };
}

/** Estado do cronômetro do Foco → sessão do item (só foco rodando ou pausado). */
export function sessionFromTimer(t: TimerState): FocusSession | null {
  if (t.phase !== "focus" || !t.sessionId || t.startedAt === null) return null;
  if (t.status !== "running" && t.status !== "paused") return null;
  return {
    id: t.sessionId,
    plannedSec: t.plannedSec,
    startedAt: t.startedAt,
    pausedMs: t.pausedMs,
    pausedAt: t.status === "paused" ? t.pausedAt : null,
  };
}

/** Momento (ms) em que o foco acaba se continuar rodando; `null` se pausado. */
export function focusEndsAt(s: FocusSession): number | null {
  return s.pausedAt === null ? s.startedAt + s.pausedMs + s.plannedSec * 1000 : null;
}

export function focusStatus(s: FocusSession | null, now: number): FocusStatus {
  if (!s) return { kind: "idle" };
  const planned = s.plannedSec * 1000;
  const end = s.pausedAt ?? now;
  const elapsed = Math.min(planned, Math.max(0, end - s.startedAt - s.pausedMs));
  const remainingSec = Math.max(0, Math.ceil((planned - elapsed) / 1000));
  const progress = planned > 0 ? elapsed / planned : 0;
  if (s.pausedAt !== null) return { kind: "paused", remainingSec, progress };
  if (remainingSec === 0) return { kind: "harvest" };
  return { kind: "running", remainingSec, progress };
}

/** Rótulo do item Foco para o leitor de tela. */
export function focusAriaLabel(status: FocusStatus): string {
  switch (status.kind) {
    case "idle":
      return "Foco";
    case "paused":
      return "Foco, pausado";
    case "harvest":
      return "Foco, fruto pronto para colher";
    case "running": {
      const min = Math.floor(status.remainingSec / 60);
      if (min === 0) return "Foco, menos de 1 minuto restante";
      return min === 1 ? "Foco, 1 minuto restante" : `Foco, ${min} minutos restantes`;
    }
  }
}
