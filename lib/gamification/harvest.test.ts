import { describe, expect, it } from "vitest";
import { nextTier, themesUnlockedBy, tierForDays, tierRank } from "./harvest";
import { canUseTheme, effectiveTheme, seasonalTheme } from "./themes";

describe("colheita da semana", () => {
  it("3–4 dias Bronze, 5–6 Prata, 7 Ouro", () => {
    expect([0, 1, 2].map(tierForDays)).toEqual([null, null, null]);
    expect([3, 4].map(tierForDays)).toEqual(["bronze", "bronze"]);
    expect([5, 6].map(tierForDays)).toEqual(["prata", "prata"]);
    expect(tierForDays(7)).toBe("ouro");
  });

  it("ordena as faixas", () => {
    expect(tierRank(null)).toBeLessThan(tierRank("bronze"));
    expect(tierRank("bronze")).toBeLessThan(tierRank("prata"));
    expect(tierRank("prata")).toBeLessThan(tierRank("ouro"));
  });

  it("indica a próxima meta", () => {
    expect(nextTier(1)).toEqual({ tier: "bronze", missing: 2 });
    expect(nextTier(4)).toEqual({ tier: "prata", missing: 1 });
    expect(nextTier(6)).toEqual({ tier: "ouro", missing: 1 });
    expect(nextTier(7)).toBeNull();
  });

  it("Prata ou melhor desbloqueia o Halloween; Ouro, o Natal", () => {
    expect(themesUnlockedBy("bronze")).toEqual([]);
    expect(themesUnlockedBy("prata")).toEqual(["halloween"]);
    expect(themesUnlockedBy("ouro")).toEqual(["halloween", "natal"]);
  });
});

describe("temas", () => {
  it("livres, conquistados e flag de admin", () => {
    const none = new Set<string>();
    expect(canUseTheme("classico", none, false)).toBe(true);
    expect(canUseTheme("noturno", none, false)).toBe(true);
    expect(canUseTheme("halloween", none, false)).toBe(false);
    expect(canUseTheme("halloween", new Set(["halloween"]), false)).toBe(true);
    expect(canUseTheme("natal", none, true)).toBe(true);
  });

  it("sugere o tema da estação em outubro e dezembro", () => {
    expect(seasonalTheme(10)).toBe("halloween");
    expect(seasonalTheme(12)).toBe("natal");
    expect(seasonalTheme(11)).toBeNull();
  });

  it("sem escolha, Noturno no modo escuro", () => {
    expect(effectiveTheme(null, true)).toBe("noturno");
    expect(effectiveTheme(null, false)).toBe("classico");
    expect(effectiveTheme("natal", true)).toBe("natal");
  });
});
