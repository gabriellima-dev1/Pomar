import { describe, expect, it } from "vitest";
import { applyDay, displayStreak, freezeUsedYesterday, type StreakState } from "./streak";

function run(days: boolean[], start: StreakState = { current: 0, best: 0, freezes: 0 }) {
  let state = start;
  const outcomes: string[] = [];
  for (const studied of days) {
    const r = applyDay(state, studied);
    state = r.state;
    outcomes.push(r.outcome);
  }
  return { state, outcomes };
}

describe("ofensiva", () => {
  it("conta dias seguidos com estudo e guarda o recorde", () => {
    const { state } = run([true, true, true]);
    expect(state).toEqual({ current: 3, best: 3, freezes: 0 });
  });

  it("zera num dia sem estudo quando não há congelamento", () => {
    const { state, outcomes } = run([true, true, false]);
    expect(state.current).toBe(0);
    expect(state.best).toBe(2);
    expect(outcomes.at(-1)).toBe("reset");
  });

  it("ganha 1 congelamento a cada 7 dias, no máximo 2", () => {
    expect(run(Array(7).fill(true)).state.freezes).toBe(1);
    expect(run(Array(14).fill(true)).state.freezes).toBe(2);
    expect(run(Array(21).fill(true)).state.freezes).toBe(2);
  });

  it("usa o congelamento automaticamente e mantém a ofensiva", () => {
    const { state, outcomes } = run([...Array(7).fill(true), false, true]);
    expect(outcomes[7]).toBe("frozen");
    expect(state).toEqual({ current: 8, best: 8, freezes: 0 });
  });

  it("dois dias sem estudo com 1 congelamento: protege o 1º e zera no 2º", () => {
    const { state, outcomes } = run([...Array(7).fill(true), false, false]);
    expect(outcomes.slice(7)).toEqual(["frozen", "reset"]);
    expect(state.current).toBe(0);
  });

  it("sem ofensiva, um dia vazio não gasta congelamento", () => {
    const { state, outcomes } = run([false], { current: 0, best: 5, freezes: 1 });
    expect(outcomes).toEqual(["idle"]);
    expect(state.freezes).toBe(1);
  });

  it("mostra hoje na ofensiva assim que houver pomodoro", () => {
    expect(displayStreak(4, true)).toBe(5);
    expect(displayStreak(4, false)).toBe(4);
  });

  it("detecta o congelamento usado ontem", () => {
    expect(freezeUsedYesterday(8, false, true)).toBe(true);
    expect(freezeUsedYesterday(0, false, true)).toBe(false);
    expect(freezeUsedYesterday(8, true, true)).toBe(false);
    expect(freezeUsedYesterday(8, false, false)).toBe(false);
  });
});
