import { describe, expect, it } from "vitest";
import {
  chapterCompletionTimes,
  closeDays,
  daysToClose,
  type CloseInput,
  type SessionRecord,
} from "./close";

const TZ = "America/Maceio"; // UTC−3

/** Pomodoro concluído de 25 min começando às `hour` locais do dia. */
function pomodoro(day: string, hour = 14, extra: Partial<SessionRecord> = {}): SessionRecord {
  const start = new Date(`${day}T${String(hour + 3).padStart(2, "0")}:00:00Z`);
  return {
    startedAt: start.toISOString(),
    endedAt: new Date(start.getTime() + 25 * 60_000).toISOString(),
    status: "completed",
    pauses: 1,
    subjectId: "s1",
    chapterId: "c1",
    ...extra,
  };
}

function input(partial: Partial<CloseInput>): CloseInput {
  return {
    timeZone: TZ,
    fromDay: "2026-11-09",
    toDay: "2026-11-09",
    streak: { current: 0, best: 0, freezes: 0 },
    sessions: [],
    chapterCompletions: [],
    dailyGoals: new Map(),
    reminderTime: null,
    existingBadgeDays: [],
    existingHarvests: [],
    unlockedThemes: new Set(),
    rng: () => 0,
    ...partial,
  };
}

describe("daysToClose", () => {
  it("fecha do dia seguinte ao último fechado até ontem", () => {
    expect(
      daysToClose({ lastClosedDay: "2026-11-07", firstDay: "2026-11-01", today: "2026-11-10" }),
    ).toEqual({ fromDay: "2026-11-08", toDay: "2026-11-09" });
  });

  it("na primeira vez, começa no 1º dia de uso", () => {
    expect(
      daysToClose({ lastClosedDay: null, firstDay: "2026-11-08", today: "2026-11-10" }),
    ).toEqual({ fromDay: "2026-11-08", toDay: "2026-11-09" });
  });

  it("nada a fechar quando ontem já foi fechado", () => {
    expect(
      daysToClose({ lastClosedDay: "2026-11-09", firstDay: "2026-11-01", today: "2026-11-10" }),
    ).toBeNull();
    expect(
      daysToClose({ lastClosedDay: null, firstDay: "2026-11-10", today: "2026-11-10" }),
    ).toBeNull();
  });
});

describe("closeDays — aceite da Fase 3", () => {
  it("um dia com pomodoro gera exatamente 1 emblema", () => {
    const r = closeDays(input({ sessions: [pomodoro("2026-11-09"), pomodoro("2026-11-09", 16)] }));
    expect(r.badges).toHaveLength(1);
    expect(r.badges[0]?.day).toBe("2026-11-09");
    expect(r.streak.current).toBe(1);
    expect(r.lastClosedDay).toBe("2026-11-09");
  });

  it("dia sem pomodoro não gera emblema", () => {
    const r = closeDays(input({ sessions: [pomodoro("2026-11-09", 14, { status: "cancelled" })] }));
    expect(r.badges).toEqual([]);
  });

  it("5 dias na semana geram Colheita de Prata e desbloqueiam o Halloween", () => {
    const days = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"];
    const r = closeDays(
      input({
        fromDay: "2026-11-09",
        toDay: "2026-11-15",
        sessions: days.map((d) => pomodoro(d)),
      }),
    );
    expect(r.badges.map((b) => b.day)).toEqual(days);
    expect(r.harvests).toEqual([
      { weekStart: "2026-11-09", tier: "prata", days: 5, upgraded: true },
    ]);
    expect(r.themes).toEqual([{ code: "halloween", week: "2026-11-09" }]);
    // Sábado e domingo sem estudo e sem congelamento: a ofensiva zera.
    expect(r.streak).toEqual({ current: 0, best: 5, freezes: 0 });
  });

  it("7 dias geram Ouro e desbloqueiam Halloween e Natal", () => {
    const days = ["09", "10", "11", "12", "13", "14", "15"].map((d) => `2026-11-${d}`);
    const r = closeDays(
      input({ fromDay: "2026-11-09", toDay: "2026-11-15", sessions: days.map((d) => pomodoro(d)) }),
    );
    expect(r.harvests[0]?.tier).toBe("ouro");
    expect(r.themes.map((t) => t.code)).toEqual(["halloween", "natal"]);
    expect(r.streak).toEqual({ current: 7, best: 7, freezes: 1 });
  });
});

describe("closeDays — colheita ao longo da semana", () => {
  it("sobe de Bronze para Prata usando os dias já fechados", () => {
    const r = closeDays(
      input({
        fromDay: "2026-11-13",
        toDay: "2026-11-13",
        sessions: [pomodoro("2026-11-13")],
        existingBadgeDays: ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12"],
        existingHarvests: [{ weekStart: "2026-11-09", tier: "bronze", days: 4 }],
        streak: { current: 4, best: 4, freezes: 0 },
      }),
    );
    expect(r.harvests).toEqual([
      { weekStart: "2026-11-09", tier: "prata", days: 5, upgraded: true },
    ]);
    expect(r.themes.map((t) => t.code)).toEqual(["halloween"]);
  });

  it("dia a mais na mesma faixa atualiza os dias sem nova colheita", () => {
    const r = closeDays(
      input({
        fromDay: "2026-11-12",
        toDay: "2026-11-12",
        sessions: [pomodoro("2026-11-12")],
        existingBadgeDays: ["2026-11-09", "2026-11-10", "2026-11-11"],
        existingHarvests: [{ weekStart: "2026-11-09", tier: "bronze", days: 3 }],
      }),
    );
    expect(r.harvests).toEqual([
      { weekStart: "2026-11-09", tier: "bronze", days: 4, upgraded: false },
    ]);
  });

  it("tema já conquistado não é desbloqueado de novo", () => {
    const days = ["09", "10", "11", "12", "13"].map((d) => `2026-11-${d}`);
    const r = closeDays(
      input({
        fromDay: "2026-11-09",
        toDay: "2026-11-13",
        sessions: days.map((d) => pomodoro(d)),
        unlockedThemes: new Set(["halloween"]),
      }),
    );
    expect(r.themes).toEqual([]);
  });

  it("separa semanas na virada de domingo para segunda", () => {
    const days = ["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"];
    const r = closeDays(
      input({ fromDay: "2026-11-13", toDay: "2026-11-16", sessions: days.map((d) => pomodoro(d)) }),
    );
    expect(r.harvests).toEqual([
      { weekStart: "2026-11-09", tier: "bronze", days: 3, upgraded: true },
    ]);
  });
});

describe("closeDays — contexto dos emblemas", () => {
  it("usa o dia local do fim do ciclo (fuso do usuário)", () => {
    // Começa 23:50 de 09/11 e termina 00:15 de 10/11 (horário de Maceió).
    const s: SessionRecord = {
      startedAt: "2026-11-10T02:50:00Z",
      endedAt: "2026-11-10T03:15:00Z",
      status: "completed",
      pauses: 0,
      subjectId: "s1",
      chapterId: "c1",
    };
    const r = closeDays(input({ fromDay: "2026-11-09", toDay: "2026-11-10", sessions: [s] }));
    expect(r.badges.map((b) => b.day)).toEqual(["2026-11-10"]);
  });

  it("Explorador só no 1º dia da disciplina; Bom Retorno depois de 3 dias vazios", () => {
    const history = [pomodoro("2026-11-01"), pomodoro("2026-11-05")];
    const r1 = closeDays(
      input({ fromDay: "2026-11-01", toDay: "2026-11-01", sessions: history, rng: () => 0.5 }),
    );
    // Dourado: 0.5 ≥ 2%. Pool do 1º dia: fruto_do_dia(10) explorador(5) → 0.5×15 = 7.5.
    expect(r1.badges[0]?.code).toBe("fruto_do_dia");
    const r1b = closeDays(
      input({ fromDay: "2026-11-01", toDay: "2026-11-01", sessions: history, rng: () => 0.7 }),
    );
    expect(r1b.badges[0]?.code).toBe("explorador");

    // 05/11: pool fruto_do_dia(10) retorno(5); 0.7×15 = 10.5 → retorno.
    const r2 = closeDays(
      input({ fromDay: "2026-11-05", toDay: "2026-11-05", sessions: history, rng: () => 0.7 }),
    );
    expect(r2.badges[0]?.code).toBe("retorno");
  });

  it("Finalizador no dia em que o capítulo ficou completo", () => {
    const r = closeDays(
      input({
        sessions: [pomodoro("2026-11-01"), pomodoro("2026-11-09")],
        chapterCompletions: ["2026-11-09T20:00:00Z"],
        rng: () => 0.7, // fruto_do_dia(10) finalizador(5) → 0.7×15 = 10.5
      }),
    );
    expect(r.badges[0]?.code).toBe("finalizador");
  });
});

describe("chapterCompletionTimes", () => {
  it("usa o último tópico marcado de cada capítulo completo", () => {
    expect(
      chapterCompletionTimes([
        { topics: [{ done_at: "2026-11-08T10:00:00Z" }, { done_at: "2026-11-09T10:00:00Z" }] },
        { topics: [{ done_at: "2026-11-09T10:00:00Z" }, { done_at: null }] },
        { topics: [] },
      ]),
    ).toEqual(["2026-11-09T10:00:00Z"]);
  });
});
