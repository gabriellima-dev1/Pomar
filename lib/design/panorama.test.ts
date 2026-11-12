import { describe, expect, it } from "vitest";
import { panoramaWidth, sidePanelCount, sidePanelTransform } from "./panorama.ts";

describe("cena em tela cheia", () => {
  it("no celular não estende; no computador, preenche a largura", () => {
    expect(panoramaWidth(390, 844)).toBe(390);
    expect(panoramaWidth(360, 800)).toBe(390);
    expect(panoramaWidth(1440, 900)).toBe(1351);
    expect(panoramaWidth(0, 900)).toBe(390);
  });

  it("conta os painéis de cada lado", () => {
    expect(sidePanelCount(390)).toBe(0);
    expect(sidePanelCount(800)).toBe(1);
    expect(sidePanelCount(1351)).toBe(2);
    expect(sidePanelCount(2600)).toBe(3);
  });

  it("espelha os painéis ímpares para encostarem pela mesma borda", () => {
    // Painel 1 ocupa [390, 780] espelhado: x → 780 − x.
    expect(sidePanelTransform(1)).toBe("translate(780 0) scale(-1 1)");
    expect(sidePanelTransform(2)).toBe("translate(780 0)");
    // Painel −1 ocupa [−390, 0] espelhado: x → −x.
    expect(sidePanelTransform(-1)).toBe("translate(0 0) scale(-1 1)");
    expect(sidePanelTransform(-2)).toBe("translate(-780 0)");
  });
});
