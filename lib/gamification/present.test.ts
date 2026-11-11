import { describe, expect, it } from "vitest";
import {
  albumEntries,
  badgesThisWeek,
  dayLabel,
  daysAway,
  pastWeeks,
  revealTitle,
  shortDate,
  weekRangeLabel,
  weekStrip,
} from "./present";

const history = [
  { day: "2026-11-02", code: "coruja" },
  { day: "2026-11-09", code: "coruja" },
  { day: "2026-11-10", code: "fruto_do_dia" },
];

describe("álbum", () => {
  it("lista os 12 na ordem, com contagem e dias (mais novo primeiro)", () => {
    const album = albumEntries(history);
    expect(album).toHaveLength(12);
    expect(album[0]?.code).toBe("fruto_do_dia");
    const coruja = album.find((a) => a.code === "coruja");
    expect(coruja?.count).toBe(2);
    expect(coruja?.days).toEqual(["2026-11-09", "2026-11-02"]);
    expect(album.find((a) => a.code === "lua_cheia")?.count).toBe(0);
  });
});

describe("semana", () => {
  it("monta S T Q Q S S D com hoje e os dias futuros", () => {
    const strip = weekStrip("2026-11-10", history);
    expect(strip.map((d) => d.letter).join("")).toBe("STQQSSD");
    expect(strip[0]).toMatchObject({ day: "2026-11-09", code: "coruja", isToday: false });
    expect(strip[1]).toMatchObject({ day: "2026-11-10", isToday: true, isFuture: false });
    expect(strip[2]?.isFuture).toBe(true);
    expect(badgesThisWeek("2026-11-10", history)).toBe(2);
  });

  it("rótulo do período, inclusive na virada do mês", () => {
    expect(weekRangeLabel("2026-11-09")).toBe("9 a 15 de nov.");
    expect(weekRangeLabel("2026-10-26")).toBe("26 de out. a 1º de nov.");
  });
});

describe("rótulos de data", () => {
  it("dia da semana e data curta", () => {
    expect(dayLabel("2026-11-09")).toBe("segunda, 9 de nov.");
    expect(shortDate("2026-11-01")).toBe("1º de nov.");
  });

  it("título da revelação", () => {
    expect(revealTitle("2026-11-09", "2026-11-10")).toBe("Seu fruto de ontem");
    expect(revealTitle("2026-11-07", "2026-11-10")).toBe("Seu fruto de sábado, 7 de nov.");
  });
});

describe("daysAway", () => {
  it("conta os dias vazios desde o último emblema", () => {
    expect(daysAway(history, "2026-11-11")).toBe(0);
    expect(daysAway(history, "2026-11-15")).toBe(4);
    expect(daysAway([], "2026-11-15")).toBeNull();
  });
});

describe("pastWeeks", () => {
  it("lista colheitas e semanas mais leves desde a 1ª semana com emblema", () => {
    const h = [
      { day: "2026-10-20", code: "coruja" },
      { day: "2026-10-27", code: "coruja" },
      { day: "2026-10-28", code: "coruja" },
      { day: "2026-10-29", code: "coruja" },
      { day: "2026-11-10", code: "coruja" },
    ];
    const harvests = [{ weekStart: "2026-10-26", tier: "bronze" as const, days: 3 }];
    expect(pastWeeks(h, harvests, "2026-11-10")).toEqual([
      { weekStart: "2026-11-02", tier: null, days: 0 },
      { weekStart: "2026-10-26", tier: "bronze", days: 3 },
      { weekStart: "2026-10-19", tier: null, days: 1 },
    ]);
  });

  it("sem emblema, sem histórico", () => {
    expect(pastWeeks([], [], "2026-11-10")).toEqual([]);
  });
});
