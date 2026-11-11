import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { generateTokensCss, type DesignTokens } from "./tokens.ts";

const read = (p: string) =>
  readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), "utf8");
const tokens = JSON.parse(read("docs/design/tokens.json")) as DesignTokens;

describe("tokens do design system", () => {
  const css = generateTokensCss(tokens);

  it.each(["app/tokens.css", "docs/design/tokens.css"])(
    "%s está em dia com o tokens.json (rode npm run tokens)",
    (file) => {
      expect(read(file)).toBe(css);
    },
  );

  it("define todos os tokens de cor nos 4 temas (cenas inclusive, Fase 3)", () => {
    for (const theme of tokens.color.themes) {
      expect(css).toContain(`[data-theme="${theme.id}"]`);
    }
    for (const tok of tokens.color.tokens) {
      if (typeof tok.value === "string") continue;
      expect(Object.keys(tok.value), tok.name).toHaveLength(4);
    }
  });

  it("um tema sem valor próprio herda o do :root", () => {
    const synthetic: DesignTokens = {
      ...tokens,
      color: {
        themes: tokens.color.themes,
        tokens: [{ name: "scene-teste", value: { classico: "#123456" } }],
      },
    };
    const out = generateTokensCss(synthetic);
    const noturno = out.slice(out.indexOf('[data-theme="noturno"]'));
    expect(noturno.slice(0, noturno.indexOf("}"))).not.toContain("--scene-teste");
    expect(out.slice(0, out.indexOf('[data-theme="noturno"]'))).toContain(
      "--scene-teste: #123456;",
    );
  });

  it("usa o Noturno no modo escuro sem tema escolhido", () => {
    expect(css).toMatch(/prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-theme\]\)/);
  });
});
