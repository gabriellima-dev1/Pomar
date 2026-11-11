/**
 * Calibração do ritmo de leitura (DESIGN.md §4.2). Funções puras.
 * Mesmos limites de supabase/migrations/*_calibracoes.sql.
 */

export const PACE_MIN = 0.1;
export const PACE_MAX = 60;
export const PAGES_MAX = 500;
export const SECONDS_MAX = 36000;

export type CalibrationSource = "stopwatch" | "manual";

export type CalibrationInput = {
  source: CalibrationSource;
  pages: number;
  seconds: number;
};

export type CalibrationResult =
  { ok: true; value: CalibrationInput; minPerPage: number } | { ok: false; error: string };

/** min/página com 2 casas, igual ao `round(..., 2)` do banco. */
export function paceFromMeasurement(pages: number, seconds: number): number {
  return Math.round((seconds / 60 / pages) * 100) / 100;
}

/** Aceita "2", "2,5", "2.5" e " 2,50 ". Devolve `null` se não for um número positivo. */
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseIntStrict(text: string): number | null {
  const t = text.trim();
  if (!/^\d+$/.test(t)) return null;
  return Number(t);
}

/**
 * Lê o formulário de calibração:
 * - cronômetro: `segundos` (medidos) + `paginas` (lidas)
 * - manual: `minutos_por_pagina` (vira 1 página × minutos × 60 s)
 */
export function parseCalibration(fields: {
  source: string;
  pages?: string;
  seconds?: string;
  minutesPerPage?: string;
}): CalibrationResult {
  let input: CalibrationInput;

  if (fields.source === "stopwatch") {
    const pages = parseIntStrict(fields.pages ?? "");
    const seconds = parseIntStrict(fields.seconds ?? "");
    if (seconds === null || seconds < 1) {
      return { ok: false, error: "Inicie e pare o cronômetro antes de salvar." };
    }
    if (seconds > SECONDS_MAX) {
      return { ok: false, error: "A medição passou de 10 horas. Que tal medir de novo?" };
    }
    if (pages === null || pages < 1) {
      return { ok: false, error: "Informe quantas páginas você leu (1 ou mais)." };
    }
    if (pages > PAGES_MAX) return { ok: false, error: `Use até ${PAGES_MAX} páginas.` };
    input = { source: "stopwatch", pages, seconds };
  } else if (fields.source === "manual") {
    const minutes = parseDecimal(fields.minutesPerPage ?? "");
    if (minutes === null) {
      return { ok: false, error: "Informe quantos minutos você leva por página (ex.: 2,5)." };
    }
    input = { source: "manual", pages: 1, seconds: Math.round(minutes * 60) };
  } else {
    return { ok: false, error: "Escolha como calibrar." };
  }

  const minPerPage = paceFromMeasurement(input.pages, input.seconds);
  if (minPerPage < PACE_MIN || minPerPage > PACE_MAX) {
    return {
      ok: false,
      error: "Esse ritmo parece fora do comum (entre 0,1 e 60 min por página). Confira os valores.",
    };
  }
  return { ok: true, value: input, minPerPage };
}

/** Segundos inteiros decorridos desde `startedAt` (ms). Baseado em timestamps: não atrasa com a aba oculta. */
export function elapsedSeconds(startedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

/** "05:07", "1:02:03". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Mini cronômetro da calibração (Iniciar → Pausar/Continuar → Parar), baseado em timestamps. */
export type Stopwatch = {
  status: "idle" | "running" | "paused" | "stopped";
  /** Início do trecho atual em ms (só quando `running`). */
  startedAt: number | null;
  /** Tempo já medido nos trechos anteriores. */
  accumulatedMs: number;
};

export const IDLE_STOPWATCH: Stopwatch = { status: "idle", startedAt: null, accumulatedMs: 0 };

export function stopwatchMs(sw: Stopwatch, now: number): number {
  const current = sw.status === "running" && sw.startedAt !== null ? now - sw.startedAt : 0;
  return Math.max(0, sw.accumulatedMs + Math.max(0, current));
}

export function stopwatchSeconds(sw: Stopwatch, now: number): number {
  return Math.floor(stopwatchMs(sw, now) / 1000);
}

/** Iniciar (do zero) ou continuar depois de uma pausa. */
export function runStopwatch(sw: Stopwatch, now: number): Stopwatch {
  if (sw.status === "running") return sw;
  const accumulatedMs = sw.status === "paused" ? sw.accumulatedMs : 0;
  return { status: "running", startedAt: now, accumulatedMs };
}

export function pauseStopwatch(sw: Stopwatch, now: number): Stopwatch {
  if (sw.status !== "running") return sw;
  return { status: "paused", startedAt: null, accumulatedMs: stopwatchMs(sw, now) };
}

export function stopStopwatch(sw: Stopwatch, now: number): Stopwatch {
  if (sw.status === "idle" || sw.status === "stopped") return sw;
  return { status: "stopped", startedAt: null, accumulatedMs: stopwatchMs(sw, now) };
}
