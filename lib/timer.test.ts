import { describe, expect, it } from "vitest";
import {
  breakAfter,
  clampMinutes,
  countsAsCompleted,
  deserialize,
  elapsedMs,
  finish,
  formatTimer,
  isTimeUp,
  nextCycles,
  pause,
  progress,
  readyState,
  remainingSec,
  resume,
  serialize,
  start,
  stepMinutes,
  type TimerState,
} from "./timer.ts";

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 12, 13, 0, 0);
const ctx = { subjectId: "s1", topicId: "t1", cyclesDone: 0, day: "2026-11-12" };

function running(minutes = 25): TimerState {
  return start(readyState("focus", minutes, ctx), T0, "sessao-1");
}

describe("começar", () => {
  it("fica pronto com o tempo cheio e só corre depois de começar", () => {
    const ready = readyState("focus", 25, ctx);
    expect(ready.status).toBe("ready");
    expect(remainingSec(ready, T0 + 10 * MIN)).toBe(25 * 60);
    const r = start(ready, T0, "sessao-1");
    expect(r.status).toBe("running");
    expect(r.sessionId).toBe("sessao-1");
    expect(remainingSec(r, T0)).toBe(25 * 60);
    expect(formatTimer(remainingSec(r, T0 + 1))).toBe("25:00");
    expect(formatTimer(remainingSec(r, T0 + 6 * MIN + 18_000))).toBe("18:42");
  });

  it("começar de novo uma fase em andamento não muda nada", () => {
    const r = running();
    expect(start(r, T0 + MIN)).toBe(r);
  });
});

describe("aba oculta (sem ticks no meio)", () => {
  it("calcula o restante só pelos timestamps", () => {
    const r = running();
    // Nenhuma chamada entre T0 e T0 + 10 min: o navegador pode ter congelado a aba.
    expect(remainingSec(r, T0 + 10 * MIN)).toBe(15 * 60);
    expect(progress(r, T0 + 10 * MIN)).toBeCloseTo(0.4);
  });

  it("passar do fim com a aba oculta dá 00:00 e tempo esgotado", () => {
    const r = running();
    expect(remainingSec(r, T0 + 40 * MIN)).toBe(0);
    expect(isTimeUp(r, T0 + 40 * MIN)).toBe(true);
    expect(elapsedMs(r, T0 + 40 * MIN)).toBe(25 * MIN);
    expect(progress(r, T0 + 40 * MIN)).toBe(1);
  });

  it("não considera o tempo esgotado antes da hora", () => {
    expect(isTimeUp(running(), T0 + 25 * MIN - 1_000)).toBe(false);
  });
});

describe("recarregar a página", () => {
  it("restaura uma fase correndo com o restante certo", () => {
    const saved = serialize(running());
    const restored = deserialize(saved);
    expect(restored).not.toBeNull();
    expect(remainingSec(restored!, T0 + 7 * MIN)).toBe(18 * 60);
  });

  it("restaura uma fase pausada sem contar o tempo parado", () => {
    const paused = pause(running(), T0 + 5 * MIN);
    const restored = deserialize(serialize(paused))!;
    expect(restored.status).toBe("paused");
    // Recarregou 30 min depois: continua em 20:00.
    expect(remainingSec(restored, T0 + 35 * MIN)).toBe(20 * 60);
    const resumed = resume(restored, T0 + 35 * MIN);
    expect(remainingSec(resumed, T0 + 36 * MIN)).toBe(19 * 60);
  });

  it("restaura uma fase pronta e uma encerrada", () => {
    const ready = readyState("short_break", 5, ctx);
    expect(deserialize(serialize(ready))).toEqual(ready);
    const done = finish(running());
    expect(remainingSec(deserialize(serialize(done))!, T0)).toBe(0);
  });

  it("descarta estado inválido, de outra versão ou corrompido", () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize("")).toBeNull();
    expect(deserialize("{quebrado")).toBeNull();
    expect(deserialize("42")).toBeNull();
    expect(deserialize(JSON.stringify({ ...running(), v: 0 }))).toBeNull();
    expect(deserialize(JSON.stringify({ ...running(), phase: "almoço" }))).toBeNull();
    expect(deserialize(JSON.stringify({ ...running(), plannedSec: -1 }))).toBeNull();
    expect(deserialize(JSON.stringify({ ...running(), startedAt: null }))).toBeNull();
    expect(
      deserialize(JSON.stringify({ ...pause(running(), T0 + MIN), pausedAt: null })),
    ).toBeNull();
  });
});

describe("pausa", () => {
  it("o tempo pausado não conta", () => {
    const paused = pause(running(), T0 + 5 * MIN);
    expect(remainingSec(paused, T0 + 50 * MIN)).toBe(20 * 60);
    const resumed = resume(paused, T0 + 15 * MIN);
    expect(resumed.pausedMs).toBe(10 * MIN);
    expect(remainingSec(resumed, T0 + 20 * MIN)).toBe(15 * 60);
  });

  it("soma várias pausas e conta quantas foram", () => {
    let s = running();
    s = pause(s, T0 + 2 * MIN);
    s = resume(s, T0 + 4 * MIN);
    s = pause(s, T0 + 10 * MIN);
    s = resume(s, T0 + 13 * MIN);
    expect(s.pauses).toBe(2);
    expect(s.pausedMs).toBe(5 * MIN);
    expect(remainingSec(s, T0 + 30 * MIN)).toBe(0);
    expect(remainingSec(s, T0 + 29 * MIN)).toBe(60);
  });

  it("pausar duas vezes ou retomar sem pausa não muda nada", () => {
    const paused = pause(running(), T0 + MIN);
    expect(pause(paused, T0 + 2 * MIN)).toBe(paused);
    const r = running();
    expect(resume(r, T0 + MIN)).toBe(r);
    const ready = readyState("focus", 25, ctx);
    expect(pause(ready, T0)).toBe(ready);
  });

  it("uma fase pausada nunca esgota o tempo", () => {
    const paused = pause(running(), T0 + 24 * MIN);
    expect(isTimeUp(paused, T0 + 99 * MIN)).toBe(false);
  });
});

describe("regra dos 90%", () => {
  it("conta a partir de 90% do foco planejado", () => {
    expect(countsAsCompleted(1350, 1500)).toBe(true);
    expect(countsAsCompleted(1349, 1500)).toBe(false);
    expect(countsAsCompleted(1500, 1500)).toBe(true);
    expect(countsAsCompleted(100, 0)).toBe(false);
  });
});

describe("ciclos e limites", () => {
  it("descanso longo a cada 4 ciclos", () => {
    expect([1, 2, 3, 4, 5, 8].map(breakAfter)).toEqual([
      "short_break",
      "short_break",
      "short_break",
      "long_break",
      "short_break",
      "long_break",
    ]);
  });

  it("zera a contagem depois do descanso longo e na virada do dia", () => {
    expect(
      nextCycles({ phase: "short_break", cyclesDone: 2, day: "2026-11-12" }, "2026-11-12"),
    ).toBe(2);
    expect(
      nextCycles({ phase: "long_break", cyclesDone: 4, day: "2026-11-12" }, "2026-11-12"),
    ).toBe(0);
    expect(
      nextCycles({ phase: "short_break", cyclesDone: 3, day: "2026-11-11" }, "2026-11-12"),
    ).toBe(0);
  });

  it("−5/+5 respeita os limites de cada fase", () => {
    expect(stepMinutes("focus", 25, 1)).toBe(30);
    expect(stepMinutes("focus", 60, 1)).toBe(60);
    expect(stepMinutes("focus", 15, -1)).toBe(15);
    expect(stepMinutes("short_break", 5, -1)).toBe(5);
    expect(stepMinutes("short_break", 30, 1)).toBe(30);
    expect(stepMinutes("long_break", 10, -1)).toBe(10);
    expect(stepMinutes("long_break", 15, 1)).toBe(20);
  });

  it("ajusta valores fora do passo ou do limite", () => {
    expect(clampMinutes("focus", 23)).toBe(25);
    expect(clampMinutes("focus", 90)).toBe(60);
    expect(clampMinutes("long_break", 0)).toBe(10);
    expect(clampMinutes("focus", Number.NaN)).toBe(15);
  });
});
