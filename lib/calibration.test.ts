import { describe, expect, it } from "vitest";
import {
  elapsedSeconds,
  formatClock,
  paceFromMeasurement,
  parseCalibration,
  parseDecimal,
} from "./calibration";

describe("paceFromMeasurement", () => {
  it("converte segundos e páginas em min/página", () => {
    expect(paceFromMeasurement(2, 300)).toBe(2.5);
    expect(paceFromMeasurement(3, 100)).toBe(0.56);
  });
});

describe("parseDecimal", () => {
  it.each([
    ["2", 2],
    ["2,5", 2.5],
    ["2.5", 2.5],
    [" 3,25 ", 3.25],
  ])("%s → %s", (text, value) => {
    expect(parseDecimal(text)).toBe(value);
  });

  it.each(["", "abc", "-1", "0", "1,2,3"])("%s é inválido", (text) => {
    expect(parseDecimal(text)).toBeNull();
  });
});

describe("parseCalibration", () => {
  it("cronômetro: usa segundos medidos e páginas lidas", () => {
    expect(parseCalibration({ source: "stopwatch", seconds: "360", pages: "3" })).toEqual({
      ok: true,
      value: { source: "stopwatch", pages: 3, seconds: 360 },
      minPerPage: 2,
    });
  });

  it("cronômetro sem medição ou sem páginas dá erro", () => {
    expect(parseCalibration({ source: "stopwatch", seconds: "0", pages: "2" }).ok).toBe(false);
    expect(parseCalibration({ source: "stopwatch", seconds: "120", pages: "" }).ok).toBe(false);
    expect(parseCalibration({ source: "stopwatch", seconds: "120", pages: "1,5" }).ok).toBe(false);
  });

  it("manual: minutos por página viram 1 página", () => {
    expect(parseCalibration({ source: "manual", minutesPerPage: "2,5" })).toEqual({
      ok: true,
      value: { source: "manual", pages: 1, seconds: 150 },
      minPerPage: 2.5,
    });
  });

  it("rejeita ritmos fora do intervalo", () => {
    expect(parseCalibration({ source: "manual", minutesPerPage: "90" }).ok).toBe(false);
    expect(parseCalibration({ source: "stopwatch", seconds: "5", pages: "100" }).ok).toBe(false);
  });

  it("rejeita origem desconhecida", () => {
    expect(parseCalibration({ source: "auto" }).ok).toBe(false);
  });
});

describe("cronômetro", () => {
  it("conta pelo relógio, não por ticks (aba oculta não atrasa)", () => {
    const start = 1_000_000;
    expect(elapsedSeconds(start, start + 125_900)).toBe(125);
    expect(elapsedSeconds(start, start - 10)).toBe(0);
  });

  it("formata mm:ss e h:mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(307)).toBe("05:07");
    expect(formatClock(3723)).toBe("1:02:03");
  });
});
