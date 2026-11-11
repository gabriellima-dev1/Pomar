import { describe, expect, it } from "vitest";
import { nextEma, observedPace, shouldSuggest } from "./pace.ts";

describe("ritmo observado", () => {
  it("divide o foco pelas páginas", () => {
    expect(observedPace(1500, 6)).toBe(4.17);
    expect(observedPace(1500, 0)).toBeNull();
    expect(observedPace(0, 3)).toBeNull();
  });
});

describe("média móvel", () => {
  it("parte do ritmo atual e anda 30% na direção do observado", () => {
    expect(nextEma(null, 4, 3)).toBe(3.3);
    expect(nextEma(3.3, 4, 3)).toBe(3.51);
  });

  it("um ciclo fora da curva não sugere; um ritmo que se repete, sim", () => {
    const current = 3;
    let ema = nextEma(null, 4.2, current);
    expect(shouldSuggest(ema, current)).toBe(false); // 3,36: +12%
    ema = nextEma(ema, 4.2, current);
    expect(shouldSuggest(ema, current)).toBe(true); // 3,61: +20,3%
  });

  it("vale também para quem lê mais rápido", () => {
    expect(shouldSuggest(2.3, 3)).toBe(true);
    expect(shouldSuggest(2.5, 3)).toBe(false);
    expect(shouldSuggest(2, 0)).toBe(false);
  });
});
