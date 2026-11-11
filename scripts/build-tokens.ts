/**
 * Gera app/tokens.css e docs/design/tokens.css a partir de docs/design/tokens.json.
 * Uso: npm run tokens
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateTokensCss, type DesignTokens } from "../lib/design/tokens.ts";

const path = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const tokens = JSON.parse(readFileSync(path("docs/design/tokens.json"), "utf8")) as DesignTokens;
const css = generateTokensCss(tokens);

for (const target of ["app/tokens.css", "docs/design/tokens.css"]) {
  writeFileSync(path(target), css);
  console.log(`✓ ${target}`);
}
