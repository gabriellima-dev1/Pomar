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

  it("define todos os tokens de cor para os 4 temas", () => {
    for (const theme of tokens.color.themes) {
      expect(css).toContain(`[data-theme="${theme.id}"]`);
    }
    for (const tok of tokens.color.tokens) {
      expect(typeof tok.value === "string" || Object.keys(tok.value).length === 4).toBe(true);
    }
  });

  it("usa o Noturno no modo escuro sem tema escolhido", () => {
    expect(css).toMatch(/prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-theme\]\)/);
  });
});
