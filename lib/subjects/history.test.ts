import { describe, expect, it } from "vitest";
import { forecastDay, summarizeHistory } from "./history.ts";

const session = (subject: string, start: string, end: string, paused = 0) => ({
  subject_id: subject,
  started_at: start,
  ended_at: end,
  paused_sec: paused,
});

describe("histórico por disciplina", () => {
  it("soma o foco por dia local, sem as pausas", () => {
    const h = summarizeHistory(
      [
        session("a", "2026-11-11T12:00:00Z", "2026-11-11T12:25:00Z"),
        session("a", "2026-11-11T13:00:00Z", "2026-11-11T13:30:00Z", 300),
        // 23h50 em Maceió ainda é dia 11.
        session("a", "2026-11-12T02:25:00Z", "2026-11-12T02:50:00Z"),
        session("b", "2026-11-12T12:00:00Z", "2026-11-12T12:25:00Z"),
        { subject_id: null, started_at: "x", ended_at: "y", paused_sec: 0 },
      ],
      "America/Maceio",
    );
    const a = h.get("a")!;
    expect(a.days).toEqual([{ day: "2026-11-11", minutes: 75 }]);
    expect(a.firstDay).toBe("2026-11-11");
    expect(a.lastEndedAt).toBe("2026-11-12T02:50:00Z");
    expect(h.get("b")?.firstDay).toBe("2026-11-12");
  });

  it("prevê o término pela média diária", () => {
    const history = {
      lastEndedAt: "",
      firstDay: "2026-11-11",
      days: [{ day: "2026-11-11", minutes: 60 }],
    };
    // 2 dias de histórico → 30 min/dia; 100 min restantes → 4 dias.
    expect(forecastDay(100, history, "2026-11-12")).toBe("2026-11-16");
    expect(forecastDay(0, history, "2026-11-12")).toBeNull();
    expect(forecastDay(100, undefined, "2026-11-12")).toBeNull();
  });
});
