import { describe, expect, it } from "vitest";
import {
  bestHours,
  bySubject,
  comparisonText,
  focusBars,
  focusSummary,
  formatHM,
  heatTone,
  paceSeries,
  paceTrend,
  periodFor,
  periodLabel,
  predictedVsActual,
  roundedPcts,
  shiftPeriod,
  yearHeatmap,
  type StatSession,
} from "./stats.ts";

const TZ = "America/Maceio";

/** Ciclo que termina no dia/hora local (UTC−3), com `min` minutos de foco. */
function s(day: string, hour: number, min: number, extra: Partial<StatSession> = {}): StatSession {
  const end = new Date(Date.parse(`${day}T00:00:00Z`) + (hour + 3) * 3_600_000);
  return {
    started_at: new Date(end.getTime() - min * 60_000).toISOString(),
    ended_at: end.toISOString(),
    paused_sec: 0,
    pauses: 0,
    subject_id: "alg",
    topic_id: null,
    pages_logged: null,
    ...extra,
  };
}

describe("períodos", () => {
  it("semana, mês e ano que contêm o dia", () => {
    expect(periodFor("semana", "2026-11-05")).toMatchObject({
      start: "2026-11-02",
      end: "2026-11-08",
    });
    expect(periodFor("mes", "2026-02-10")).toMatchObject({
      start: "2026-02-01",
      end: "2026-02-28",
    });
    expect(periodFor("ano", "2026-07-01")).toMatchObject({
      start: "2026-01-01",
      end: "2026-12-31",
    });
  });

  it("navega para o anterior e o seguinte", () => {
    expect(shiftPeriod(periodFor("semana", "2026-11-05"), -1).start).toBe("2026-10-26");
    expect(shiftPeriod(periodFor("mes", "2026-01-15"), -1).start).toBe("2025-12-01");
    expect(shiftPeriod(periodFor("ano", "2026-01-15"), 1).start).toBe("2027-01-01");
  });

  it("rótulos como na referência 29", () => {
    expect(periodLabel(periodFor("semana", "2026-11-05"))).toBe("2 a 8 de novembro");
    expect(periodLabel(periodFor("semana", "2026-12-01"))).toBe("30 de novembro a 6 de dezembro");
    expect(periodLabel(periodFor("mes", "2026-11-05"))).toBe("novembro de 2026");
    expect(periodLabel(periodFor("ano", "2026-11-05"))).toBe("2026");
  });
});

describe("tempo de foco", () => {
  const sessions = [
    s("2026-11-02", 10, 25),
    s("2026-11-02", 11, 25, { pauses: 1, paused_sec: 120 }),
    s("2026-11-04", 20, 50),
    s("2026-10-28", 9, 25), // semana anterior
    s("2026-11-02", 23, 25), // 23h local de segunda = terça 02h UTC: conta na segunda
  ];
  const week = periodFor("semana", "2026-11-04");

  it("barras por dia no fuso do usuário", () => {
    const bars = focusBars(sessions, week, TZ, "2026-11-05");
    expect(bars.map((b) => b.minutes)).toEqual([73, 0, 50, 0, 0, 0, 0]);
    expect(bars.map((b) => b.label)).toEqual(["S", "T", "Q", "Q", "S", "S", "D"]);
    expect(bars.map((b) => b.future)).toEqual([false, false, false, false, true, true, true]);
  });

  it("barras por semana no mês e por mês no ano", () => {
    const month = focusBars(sessions, periodFor("mes", "2026-11-04"), TZ, "2026-11-30");
    expect(month[0]).toMatchObject({ label: "1–1", minutes: 0 });
    expect(month[1]).toMatchObject({ label: "2–8", minutes: 123 });
    const year = focusBars(sessions, periodFor("ano", "2026-11-04"), TZ, "2026-11-30");
    expect(year[9]!.minutes).toBe(25);
    expect(year[10]!.minutes).toBe(123);
  });

  it("resumo: total, anterior, pomodoros, % sem pausa e dias", () => {
    expect(focusSummary(sessions, week, TZ)).toEqual({
      totalMin: 123,
      previousMin: 25,
      pomodoros: 4,
      noPausePct: 75,
      studyDays: 2,
    });
  });

  it("comparação em texto neutro", () => {
    expect(comparisonText("semana", 275, 235)).toBe("+40 min que a anterior");
    expect(comparisonText("semana", 100, 120)).toBe("−20 min que a anterior");
    expect(comparisonText("mes", 200, 90)).toBe("+1h 50 min que o anterior");
    expect(comparisonText("ano", 50, 50)).toBe("igual à anterior");
    expect(formatHM(275)).toBe("4h 35min");
    expect(formatHM(120)).toBe("2h");
  });
});

describe("heatmap do ano", () => {
  it("4 tons e sem dias futuros", () => {
    expect([0, 10, 30, 60, 61].map(heatTone)).toEqual([0, 1, 2, 2, 3]);
    const { weeks, studiedDays } = yearHeatmap(
      [s("2026-01-01", 10, 40), s("2026-01-05", 10, 70), s("2025-12-31", 10, 25)],
      2026,
      TZ,
      "2026-01-06",
    );
    expect(weeks).toHaveLength(2);
    expect(weeks[0]![0]).toBeNull(); // 29/12/2025 fica de fora
    expect(weeks[0]![3]).toEqual({ day: "2026-01-01", minutes: 40, tone: 2 });
    expect(weeks[1]![0]).toMatchObject({ tone: 3 });
    expect(weeks[1]![2]).toBeNull(); // 07/01 é futuro
    expect(studiedDays).toBe(2);
  });
});

describe("por disciplina", () => {
  it("tempo e %, maior primeiro; % arredondados somam 100", () => {
    const shares = bySubject(
      [
        s("2026-11-02", 10, 50),
        s("2026-11-03", 10, 25, { subject_id: "redes" }),
        s("2026-11-03", 12, 25, { subject_id: null }),
      ],
      periodFor("semana", "2026-11-02"),
      TZ,
    );
    expect(shares.map((x) => [x.id, x.minutes])).toEqual([
      ["alg", 50],
      ["redes", 25],
      [null, 25],
    ]);
    expect(roundedPcts([55.5, 36.1, 8.4])).toEqual([56, 36, 8]);
    expect(roundedPcts([33.33, 33.33, 33.34])).toEqual([33, 33, 34]);
  });
});

describe("ritmo", () => {
  it("min/página por ciclo e tendência", () => {
    const sessions = [
      s("2026-11-02", 10, 25, { pages_logged: 5 }),
      s("2026-11-03", 10, 25, { pages_logged: 0 }),
      s("2026-11-04", 10, 22, { pages_logged: 5 }),
      s("2026-11-04", 12, 25, { pages_logged: 5, subject_id: "redes" }),
    ];
    const points = paceSeries(sessions, periodFor("semana", "2026-11-02"), TZ, "alg");
    expect(points.map((p) => p.minPerPage)).toEqual([5, 4.4]);
    expect(paceTrend(points)).toEqual({ pct: 12, faster: true });
    expect(paceTrend(points.slice(0, 1))).toBeNull();
  });
});

describe("melhor horário", () => {
  it("faixa de 2 h com mais foco nos últimos 30 dias", () => {
    const best = bestHours(
      [
        s("2026-11-10", 21, 50),
        s("2026-11-09", 22, 50),
        s("2026-11-08", 9, 25),
        s("2026-09-01", 15, 500),
      ],
      TZ,
      "2026-11-12",
    );
    expect(best.start).toBe(20);
    expect(best.sharePct).toBe(80);
    expect(bestHours([], TZ, "2026-11-12").start).toBeNull();
  });
});

describe("previsto × real", () => {
  it("erro médio relativo dos tópicos concluídos no período", () => {
    const result = predictedVsActual(
      [
        {
          id: "t1",
          subject_id: "alg",
          page_start: 1,
          page_end: 10,
          done_at: "2026-11-03T15:00:00Z",
        },
        {
          id: "t2",
          subject_id: "alg",
          page_start: 1,
          page_end: 5,
          done_at: "2026-11-04T15:00:00Z",
        },
        {
          id: "t3",
          subject_id: "alg",
          page_start: 1,
          page_end: 5,
          done_at: "2026-11-04T15:00:00Z",
        },
      ],
      [
        s("2026-11-03", 10, 33, { topic_id: "t1" }), // previsto 30, real 33 → 10%
        s("2026-11-04", 10, 10, { topic_id: "t2" }), // previsto 15, real 10 → 33%
      ],
      new Map([["alg", { minPerPage: 3, videoSpeed: 1 }]]),
      null,
      periodFor("semana", "2026-11-02"),
      TZ,
    );
    expect(result).toEqual({ errorPct: 22, predictedAvg: 22.5, actualAvg: 21.5, count: 2 });
  });
});
