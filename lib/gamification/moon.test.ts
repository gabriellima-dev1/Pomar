import { describe, expect, it } from "vitest";
import { isNearFullMoon, moonAge } from "./moon";

// Datas de lua cheia e nova publicadas (UTC).
describe("fase da lua", () => {
  it("reconhece luas cheias conhecidas", () => {
    expect(isNearFullMoon(new Date("2026-11-24T14:53:00Z"))).toBe(true);
    expect(isNearFullMoon(new Date("2026-10-26T04:12:00Z"))).toBe(true);
    expect(isNearFullMoon(new Date("2026-12-24T01:28:00Z"))).toBe(true);
    expect(isNearFullMoon(new Date("2024-08-19T18:26:00Z"))).toBe(true);
  });

  it("aceita até 1 dia antes ou depois da cheia", () => {
    expect(isNearFullMoon(new Date("2026-11-23T20:00:00Z"))).toBe(true);
    expect(isNearFullMoon(new Date("2026-11-25T08:00:00Z"))).toBe(true);
  });

  it("recusa a lua nova e os quartos", () => {
    expect(isNearFullMoon(new Date("2026-11-09T07:02:00Z"))).toBe(false);
    expect(isNearFullMoon(new Date("2026-11-17T11:48:00Z"))).toBe(false);
    expect(isNearFullMoon(new Date("2026-11-30T00:00:00Z"))).toBe(false);
  });

  it("idade perto de zero na lua nova", () => {
    const age = moonAge(new Date("2026-11-09T07:02:00Z"));
    // A lunação média erra até ~0,7 dia; a janela do emblema é de ±1 dia.
    expect(Math.min(age, 29.53 - age)).toBeLessThan(0.8);
  });
});
