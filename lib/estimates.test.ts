import { describe, expect, it } from "vitest";
import {
  DEFAULT_MIN_PER_PAGE,
  effectivePace,
  forecastFinish,
  formatDuration,
  formatPace,
  paceLabel,
  pomodorosFor,
  remainingMinutes,
  subjectProgress,
  topicMinutes,
  topicPages,
} from "./estimates";

describe("effectivePace", () => {
  it("prefere o ritmo da disciplina", () => {
    expect(effectivePace(2, 4)).toEqual({ minPerPage: 2, source: "disciplina" });
  });
  it("cai para o ritmo global", () => {
    expect(effectivePace(null, 4)).toEqual({ minPerPage: 4, source: "global" });
  });
  it("sem calibração usa 3 min/página", () => {
    expect(effectivePace(null, null)).toEqual({
      minPerPage: DEFAULT_MIN_PER_PAGE,
      source: "padrao",
    });
    expect(DEFAULT_MIN_PER_PAGE).toBe(3);
  });
  it("ignora valores zerados ou inválidos", () => {
    expect(effectivePace(0, Number.NaN).source).toBe("padrao");
  });
});

describe("paceLabel", () => {
  it("marca a estimativa padrão", () => {
    expect(paceLabel(effectivePace(null, null))).toBe(
      "3 min por página — estimativa padrão, calibre para ajustar",
    );
  });
  it("usa vírgula decimal", () => {
    expect(formatPace(2.5)).toBe("2,5 min");
    expect(paceLabel({ minPerPage: 1.25, source: "disciplina" })).toContain("1,3 min");
  });
});

describe("topicPages e topicMinutes", () => {
  it("conta as duas pontas", () => {
    expect(topicPages({ page_start: 10, page_end: 19 })).toBe(10);
    expect(topicPages({ page_start: 5, page_end: 5 })).toBe(1);
  });
  it("sem páginas conta zero", () => {
    expect(topicPages({ page_start: null, page_end: null })).toBe(0);
  });
  it("livro: páginas × ritmo", () => {
    expect(topicMinutes({ page_start: 1, page_end: 10 }, 3)).toBe(30);
  });
  it("vídeo: duração ÷ velocidade", () => {
    const video = { page_start: null, page_end: null, duration_sec: 1200 };
    expect(topicMinutes(video, 3)).toBe(20);
    expect(topicMinutes(video, 3, 2)).toBe(10);
  });
});

describe("pomodorosFor", () => {
  it("arredonda para cima", () => {
    expect(pomodorosFor(30, 25)).toBe(2);
    expect(pomodorosFor(25, 25)).toBe(1);
    expect(pomodorosFor(1, 25)).toBe(1);
  });
  it("zero quando não há tempo", () => {
    expect(pomodorosFor(0, 25)).toBe(0);
  });
});

describe("subjectProgress", () => {
  const topics = [
    { page_start: 1, page_end: 10, done_at: "2026-11-08T10:00:00Z" },
    { page_start: 11, page_end: 40, done_at: null },
  ];

  it("soma as páginas dos tópicos marcados", () => {
    expect(subjectProgress(topics, "paginas")).toEqual({
      unit: "paginas",
      total: 40,
      done: 10,
      remaining: 30,
      percent: 25,
      topicsTotal: 2,
      topicsDone: 1,
    });
  });

  it("só chega a 100% com tudo concluído", () => {
    const almost = [
      { page_start: 1, page_end: 999, done_at: "x" },
      { page_start: 1000, page_end: 1000, done_at: null },
    ];
    expect(subjectProgress(almost, "paginas").percent).toBe(99);
    expect(
      subjectProgress(
        almost.map((t) => ({ ...t, done_at: "x" })),
        "paginas",
      ).percent,
    ).toBe(100);
  });

  it("sem páginas usa a contagem de tópicos", () => {
    const noPages = [
      { page_start: null, page_end: null, done_at: "x" },
      { page_start: null, page_end: null, done_at: null },
    ];
    expect(subjectProgress(noPages, "paginas").percent).toBe(50);
  });

  it("vídeos contam minutos", () => {
    const videos = [
      { page_start: null, page_end: null, duration_sec: 600, done_at: "x" },
      { page_start: null, page_end: null, duration_sec: 1200, done_at: null },
    ];
    expect(subjectProgress(videos, "minutos")).toMatchObject({
      total: 30,
      done: 10,
      remaining: 20,
    });
  });

  it("disciplina vazia fica em 0%", () => {
    expect(subjectProgress([], "paginas").percent).toBe(0);
  });
});

describe("remainingMinutes", () => {
  it("ignora tópicos concluídos", () => {
    const topics = [
      { page_start: 1, page_end: 10, done_at: "x" },
      { page_start: 11, page_end: 20, done_at: null },
    ];
    expect(remainingMinutes(topics, 2)).toBe(20);
  });
});

describe("forecastFinish", () => {
  const today = new Date("2026-11-08T12:00:00Z");

  it("divide o restante pela média diária", () => {
    expect(forecastFinish(250, 50, today)?.toISOString().slice(0, 10)).toBe("2026-11-13");
    expect(forecastFinish(251, 50, today)?.toISOString().slice(0, 10)).toBe("2026-11-14");
  });

  it("sem histórico não há previsão", () => {
    expect(forecastFinish(250, 0, today)).toBeNull();
  });

  it("nada restante termina hoje", () => {
    expect(forecastFinish(0, 30, today)?.toISOString().slice(0, 10)).toBe("2026-11-08");
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "0 min"],
    [44.6, "45 min"],
    [60, "1 h"],
    [200, "3 h 20 min"],
  ])("%s → %s", (min, text) => {
    expect(formatDuration(min)).toBe(text);
  });
});
