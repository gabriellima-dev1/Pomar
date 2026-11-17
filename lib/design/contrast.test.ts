import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio, flatten, parseColor } from "./contrast.ts";

type Token = { name: string; value: string | Record<string, string> };
const tokens = (
  JSON.parse(
    readFileSync(fileURLToPath(new URL("../../docs/design/tokens.json", import.meta.url)), "utf8"),
  ) as { color: { tokens: Token[] } }
).color.tokens;

function tok(name: string, theme: string): string {
  const t = tokens.find((x) => x.name === name);
  if (!t) throw new Error(`Token ${name} não existe`);
  return typeof t.value === "string" ? t.value : t.value[theme]!;
}

const THEMES = ["classico", "noturno", "halloween", "natal"] as const;

/** O que pode estar atrás do painel (esquerda da cena larga): céu, nuvens e montanhas. */
const BACKDROPS = ["sky-top", "sky-mid", "sky-low", "cloud", "mountain-light", "mountain-dark"];

describe("contraste", () => {
  it("lê hex e rgba", () => {
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor("rgba(16, 26, 56, 0.62)")).toEqual({ r: 16, g: 26, b: 56, a: 0.62 });
  });

  it("calcula a razão do WCAG", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("compõe o vidro sobre a cena", () => {
    const c = flatten("rgba(0,0,0,0.5)", "#ffffff");
    expect(c.r).toBeCloseTo(127.5, 5);
  });
});

describe.each(THEMES)("painel do pomodoro no computador · %s (AA)", (theme) => {
  const glass = tok("pc-glass", theme);
  const fallback = tok("pc-glass-fallback", theme);
  // Vidro sobre cada fundo possível + o fundo opaco de reserva.
  const panels = [
    ...BACKDROPS.map((b) => flatten(glass, tok(`scene-${b}`, theme))),
    flatten(fallback),
  ];
  const min = (fg: string, layers: string[] = []) =>
    Math.min(...panels.map((bg) => contrastRatio(fg, flatten(...layers, bg))));

  it("texto do vidro (ciclo, barra, atalhos, Encerrar) ≥ 4,5", () => {
    expect(min(tok("pc-ink", theme))).toBeGreaterThanOrEqual(4.5);
    expect(min(tok("pc-end-ink", theme))).toBeGreaterThanOrEqual(4.5);
  });

  it("chip da fase ≥ 4,5", () => {
    expect(contrastRatio(tok("pc-on-chip", theme), tok("pc-chip", theme))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("caixa do tópico ≥ 4,5", () => {
    const box = [tok("pc-topic-bg", theme)];
    expect(min(tok("pc-topic-ink", theme), box)).toBeGreaterThanOrEqual(4.5);
    expect(min(tok("pc-muted", theme), box)).toBeGreaterThanOrEqual(4.5);
  });

  it("botão Pausar ≥ 4,5", () => {
    expect(min(tok("pc-pause-ink", theme), [tok("pc-pause-bg", theme)])).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});

describe.each(THEMES)("texto de XP (reward-ink) · %s (AA)", (theme) => {
  it.each(["surface-100", "surface-200", "surface-300"])("sobre %s ≥ 4,5", (bg) => {
    expect(contrastRatio(tok("reward-ink", theme), tok(bg, theme))).toBeGreaterThanOrEqual(4.5);
  });
});
