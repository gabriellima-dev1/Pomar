import { describe, expect, it } from "vitest";
import { addDays, daysBetween, localDay } from "./dates.ts";

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
});
