import { describe, expect, it } from "vitest";
import {
  focusAriaLabel,
  focusEndsAt,
  focusStatus,
  sessionFromRow,
  sessionFromTimer,
  type FocusSession,
} from "./focus-status";
import { pause, readyState, start } from "./timer";

const T0 = Date.parse("2026-11-17T13:00:00Z");
const MIN = 60_000;

function session(over: Partial<FocusSession> = {}): FocusSession {
  return { id: "s1", plannedSec: 25 * 60, startedAt: T0, pausedMs: 0, pausedAt: null, ...over };
}

describe("focusStatus", () => {
  it("sem sessão fica no estado normal", () => {
    expect(focusStatus(null, T0)).toEqual({ kind: "idle" });
  });

  it("rodando: tempo que falta e progresso do ciclo", () => {
    const st = focusStatus(session(), T0 + 6 * MIN + 18_000);
    expect(st).toEqual({ kind: "running", remainingSec: 18 * 60 + 42, progress: expect.any(Number) });
    if (st.kind === "running") expect(st.progress).toBeCloseTo((6 * 60 + 18) / (25 * 60), 5);
  });

  it("desconta as pausas já encerradas", () => {
    const st = focusStatus(session({ pausedMs: 5 * MIN }), T0 + 10 * MIN);
    expect(st).toMatchObject({ kind: "running", remainingSec: 20 * 60 });
  });

  it("pausado: o tempo para no início da pausa, mesmo horas depois", () => {
    const s = session({ pausedAt: T0 + 7 * MIN });
    expect(focusStatus(s, T0 + 3 * 60 * MIN)).toMatchObject({
      kind: "paused",
      remainingSec: 18 * 60,
    });
  });

  it("acabou fora do Foco: fruto pronto para colher", () => {
    expect(focusStatus(session(), T0 + 25 * MIN)).toEqual({ kind: "harvest" });
    expect(focusStatus(session(), T0 + 90 * MIN)).toEqual({ kind: "harvest" });
  });

  it("um relógio atrasado não mostra mais que o planejado", () => {
    expect(focusStatus(session(), T0 - 30_000)).toMatchObject({ remainingSec: 25 * 60 });
  });
});

describe("focusEndsAt", () => {
  it("fim previsto com as pausas; pausado não tem fim", () => {
    expect(focusEndsAt(session({ pausedMs: 2 * MIN }))).toBe(T0 + 27 * MIN);
    expect(focusEndsAt(session({ pausedAt: T0 + MIN }))).toBeNull();
  });
});

describe("focusAriaLabel", () => {
  it("fala os minutos inteiros que faltam", () => {
    expect(focusAriaLabel({ kind: "running", remainingSec: 18 * 60 + 42, progress: 0 })).toBe(
      "Foco, 18 minutos restantes",
    );
    expect(focusAriaLabel({ kind: "running", remainingSec: 61, progress: 0 })).toBe(
      "Foco, 1 minuto restante",
    );
    expect(focusAriaLabel({ kind: "running", remainingSec: 42, progress: 0 })).toBe(
      "Foco, menos de 1 minuto restante",
    );
  });

  it("pausado, colher e sem sessão", () => {
    expect(focusAriaLabel({ kind: "paused", remainingSec: 100, progress: 0 })).toBe(
      "Foco, pausado",
    );
    expect(focusAriaLabel({ kind: "harvest" })).toBe("Foco, fruto pronto para colher");
    expect(focusAriaLabel({ kind: "idle" })).toBe("Foco");
  });
});

describe("sessionFromRow", () => {
  it("converte a linha do servidor", () => {
    expect(
      sessionFromRow({
        id: "s1",
        planned_focus_sec: 1500,
        started_at: "2026-11-17T13:00:00Z",
        paused_sec: 30,
        paused_at: "2026-11-17T13:05:00Z",
      }),
    ).toEqual(session({ pausedMs: 30_000, pausedAt: T0 + 5 * MIN }));
  });

  it("linha estranha vira null", () => {
    expect(
      sessionFromRow({
        id: "s1",
        planned_focus_sec: 1500,
        started_at: "quebrado",
        paused_sec: 0,
        paused_at: null,
      }),
    ).toBeNull();
  });
});

describe("sessionFromTimer", () => {
  const ctx = { subjectId: null, topicId: null, cyclesDone: 0, day: "2026-11-17" };

  it("só foco com sessão, rodando ou pausado", () => {
    const ready = readyState("focus", 25, ctx);
    expect(sessionFromTimer(ready)).toBeNull();
    const running = start(ready, T0, "s1");
    expect(sessionFromTimer(running)).toEqual(session());
    expect(sessionFromTimer(pause(running, T0 + MIN))).toEqual(session({ pausedAt: T0 + MIN }));
  });

  it("descanso não aparece no item (fica só no aparelho)", () => {
    const pausa = start(readyState("short_break", 5, ctx), T0);
    expect(sessionFromTimer(pausa)).toBeNull();
  });
});
