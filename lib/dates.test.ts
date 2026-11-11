import { describe, expect, it } from "vitest";
import {
  addDays,
  dayRange,
  daysBetween,
  localClock,
  localDay,
  weekday,
  weekStart,
} from "./dates.ts";

describe("datas no fuso do usuário", () => {
  it("usa o dia local, não o UTC", () => {
    const instant = new Date("2026-11-13T01:30:00Z");
    expect(localDay(instant, "America/Maceio")).toBe("2026-11-12");
    expect(localDay(instant, "Europe/Lisbon")).toBe("2026-11-13");
  });

  it("conta e soma dias, inclusive na virada do mês", () => {
    expect(daysBetween("2026-11-28", "2026-12-02")).toBe(4);
    expect(daysBetween("2026-12-02", "2026-11-28")).toBe(-4);
    expect(addDays("2026-11-30", 2)).toBe("2026-12-02");
  });

  it("dá hora e minuto locais (meia-noite vira 0)", () => {
    expect(localClock(new Date("2026-11-13T01:30:00Z"), "America/Maceio")).toEqual({
      day: "2026-11-12",
      hour: 22,
      minute: 30,
    });
    expect(localClock(new Date("2026-11-13T03:05:00Z"), "America/Maceio").hour).toBe(0);
  });

  it("semana de segunda a domingo", () => {
    expect(weekday("2026-11-09")).toBe(1);
    expect(weekStart("2026-11-09")).toBe("2026-11-09");
    expect(weekStart("2026-11-15")).toBe("2026-11-09");
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
    expect(weekStart("2026-11-01")).toBe("2026-10-26");
  });

  it("lista os dias de um intervalo", () => {
    expect(dayRange("2026-11-29", "2026-12-01")).toEqual([
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
    ]);
    expect(dayRange("2026-12-01", "2026-11-29")).toEqual([]);
  });
});
