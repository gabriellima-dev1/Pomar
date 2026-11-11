import { describe, expect, it } from "vitest";
import { focusSummary, formatMinutes, type FocusSession } from "./focus-summary";

const TZ = "America/Maceio"; // UTC−3

/** Ciclo de 25 min que termina no horário local dado. */
function cycle(localEnd: string, subject: string | null = "s1", pausedSec = 0): FocusSession {
  const end = new Date(`${localEnd}:00-03:00`);
  const start = new Date(end.getTime() - 25 * 60_000 - pausedSec * 1000);
  return {
    subject_id: subject,
    started_at: start.toISOString(),
    ended_at: end.toISOString(),
    paused_sec: pausedSec,
  };
}

describe("resumo do foco (tela 21)", () => {
  // 2026-11-11 é quarta-feira; a semana começa na segunda, 09/11.
  const today = "2026-11-11";

  it("soma hoje e a semana no fuso do usuário", () => {
    const s = focusSummary(
      [
        cycle("2026-11-11T09:00"),
        cycle("2026-11-11T23:30", null), // sessão livre, ainda hoje no fuso local
        cycle("2026-11-09T08:00"),
        cycle("2026-11-08T20:00"), // domingo da semana passada
      ],
      TZ,
      today,
    );
    expect(s.todayMin).toBe(50);
    expect(s.weekMin).toBe(75);
  });

  it("desconta as pausas", () => {
    expect(focusSummary([cycle("2026-11-11T10:00", "s1", 300)], TZ, today).todayMin).toBe(25);
  });

  it("conta os pomodoros de hoje por disciplina (meta diária)", () => {
    const s = focusSummary(
      [cycle("2026-11-11T09:00"), cycle("2026-11-11T10:00"), cycle("2026-11-11T11:00", "s2")],
      TZ,
      today,
    );
    expect(s.todayBySubject.get("s1")).toBe(2);
    expect(s.todayBySubject.get("s2")).toBe(1);
  });

  it("formata minutos", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(65)).toBe("1 h 05 min");
  });
});
