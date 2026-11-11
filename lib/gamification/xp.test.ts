import { describe, expect, it } from "vitest";
import {
  completionAwards,
  pomodoroAwards,
  pomodoroXp,
  sumXp,
  topicXp,
  type CompletionState,
} from "./xp";

describe("pomodoroXp", () => {
  it("dá 10 XP para 25 min e escala com o foco", () => {
    expect(pomodoroXp(25)).toBe(10);
    expect(pomodoroXp(15)).toBe(6);
    expect(pomodoroXp(30)).toBe(12);
    expect(pomodoroXp(45)).toBe(18);
    expect(pomodoroXp(60)).toBe(24);
  });
});

describe("pomodoroAwards", () => {
  it("soma o bônus do 1º pomodoro do dia com chave por dia", () => {
    const events = pomodoroAwards({
      sessionId: "s1",
      plannedFocusSec: 1500,
      day: "2026-11-10",
      firstOfDay: true,
    });
    expect(events).toEqual([
      { source: "pomodoro", amount: 10, ref_id: "s1", dedupe_key: "pomodoro:s1" },
      { source: "first_of_day", amount: 5, ref_id: "s1", dedupe_key: "first_of_day:2026-11-10" },
    ]);
    expect(sumXp(events)).toBe(15);
  });

  it("sem bônus nos ciclos seguintes", () => {
    const events = pomodoroAwards({
      sessionId: "s2",
      plannedFocusSec: 1500,
      day: "2026-11-10",
      firstOfDay: false,
    });
    expect(sumXp(events)).toBe(10);
  });
});

describe("topicXp", () => {
  it("1 por página, até 20", () => {
    expect(topicXp({ page_start: 10, page_end: 16, duration_sec: null })).toBe(7);
    expect(topicXp({ page_start: 1, page_end: 80, duration_sec: null })).toBe(20);
    expect(topicXp({ page_start: null, page_end: null, duration_sec: null })).toBe(0);
  });

  it("vídeo: 1 a cada 5 min, até 20", () => {
    expect(topicXp({ page_start: null, page_end: null, duration_sec: 14 * 60 })).toBe(2);
    expect(topicXp({ page_start: null, page_end: null, duration_sec: 4 * 3600 })).toBe(20);
  });
});

describe("completionAwards", () => {
  const base: CompletionState = {
    subjectHasPomodoro: true,
    subjectId: "sub",
    topic: { id: "t1", page_start: 1, page_end: 10, duration_sec: null, done: true },
    chapter: { id: "c1", allDone: false },
    subjectAllDone: false,
  };

  it("dá XP do tópico com chave por tópico", () => {
    expect(completionAwards(base)).toEqual([
      { source: "topic", amount: 10, ref_id: "t1", dedupe_key: "topic:t1" },
    ]);
  });

  it("soma capítulo (+15) e disciplina (+100) quando ficam completos", () => {
    const events = completionAwards({
      ...base,
      chapter: { id: "c1", allDone: true },
      subjectAllDone: true,
    });
    expect(events.map((e) => e.dedupe_key)).toEqual(["topic:t1", "chapter:c1", "subject:sub"]);
    expect(sumXp(events)).toBe(125);
  });

  it("não dá XP sem nenhum pomodoro concluído na disciplina", () => {
    expect(completionAwards({ ...base, subjectHasPomodoro: false, subjectAllDone: true })).toEqual(
      [],
    );
  });

  it("não dá XP ao desmarcar", () => {
    expect(completionAwards({ ...base, topic: { ...base.topic, done: false } })).toEqual([]);
  });
});
