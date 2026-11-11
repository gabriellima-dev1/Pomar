import { describe, expect, it } from "vitest";
import {
  levelForXp,
  nextStage,
  progressToNext,
  stageChanged,
  stageForLevel,
  xpForLevel,
} from "./levels";

describe("xpForLevel", () => {
  it("segue 25 × n × (n − 1) com os exemplos do DESIGN §6.2", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(50);
    expect(xpForLevel(3)).toBe(150);
    expect(xpForLevel(5)).toBe(500);
    expect(xpForLevel(10)).toBe(2250);
  });
});

describe("levelForXp", () => {
  it("é o maior nível cujo limiar já foi alcançado", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(149)).toBe(2);
    expect(levelForXp(150)).toBe(3);
    expect(levelForXp(2249)).toBe(9);
    expect(levelForXp(2250)).toBe(10);
  });

  it("é coerente com xpForLevel até o nível 100", () => {
    for (let n = 1; n <= 100; n++) {
      expect(levelForXp(xpForLevel(n))).toBe(n);
      if (n > 1) expect(levelForXp(xpForLevel(n) - 1)).toBe(n - 1);
    }
  });

  it("trata valores negativos ou fracionários", () => {
    expect(levelForXp(-10)).toBe(1);
    expect(levelForXp(50.9)).toBe(2);
  });
});

describe("progressToNext", () => {
  it("mostra quanto falta (referência 09: 410 XP → nível 4, faltam 90)", () => {
    const p = progressToNext(410);
    expect(p.level).toBe(4);
    expect(p.remaining).toBe(90);
    expect(p.current).toBe(110);
    expect(p.span).toBe(200);
    expect(p.ratio).toBeCloseTo(0.55);
  });
});

describe("estágios da árvore", () => {
  it("muda 1–2, arbusto 3–5, jovem 6–9, adulta 10–14, frondosa 15+", () => {
    expect([1, 2].map(stageForLevel)).toEqual(["muda", "muda"]);
    expect([3, 5].map(stageForLevel)).toEqual(["arbusto", "arbusto"]);
    expect([6, 9].map(stageForLevel)).toEqual(["jovem", "jovem"]);
    expect([10, 14].map(stageForLevel)).toEqual(["adulta", "adulta"]);
    expect([15, 40].map(stageForLevel)).toEqual(["frondosa", "frondosa"]);
  });

  it("indica o próximo estágio", () => {
    expect(nextStage(6)).toEqual({ stage: "adulta", level: 10 });
    expect(nextStage(15)).toBeNull();
  });

  it("celebra só quando o estágio muda", () => {
    expect(stageChanged(2, 3)).toBe(true);
    expect(stageChanged(5, 6)).toBe(true);
    expect(stageChanged(3, 4)).toBe(false);
    expect(stageChanged(9, 10)).toBe(true);
    expect(stageChanged(14, 15)).toBe(true);
    expect(stageChanged(1, 4)).toBe(true);
    expect(stageChanged(4, 4)).toBe(false);
  });
});
