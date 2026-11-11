/**
 * Gera o CSS dos tokens a partir de docs/design/tokens.json (design system "Pomar").
 * Função pura: o script `npm run tokens` grava o resultado em app/tokens.css e
 * docs/design/tokens.css, e um teste garante que os arquivos não divergem do JSON.
 */

type Themed = Record<string, string>;
type Token = { name: string; value: string | Themed };
type TextStyle = {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: string;
  fontVariantNumeric?: string;
};

export type DesignTokens = {
  name: string;
  color: { themes: { id: string; name: string }[]; tokens: Token[] };
  type: {
    families: Record<string, string>;
    groups: { family: string; styles: TextStyle[] }[];
  };
  spacing: { tokens: Token[] };
  radius: { tokens: Token[] };
  shadow: { tokens: Token[] };
  size: { tokens: Token[] };
  meta: { synced: string };
};

/** Tema usado quando o sistema está em modo escuro e nenhum tema foi escolhido. */
const DARK_THEME = "noturno";

/** Propriedades extras de estilos de texto (o JSON não as descreve). */
const TEXT_EXTRAS: Record<string, string[]> = {
  timer: ["font-variant-numeric: tabular-nums;"],
  caption: ["text-transform: uppercase;"],
};

function brDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function staticValue(token: Token): string {
  if (typeof token.value !== "string") throw new Error(`Token ${token.name} deveria ser fixo.`);
  return token.value;
}

function themedValue(token: Token, theme: string): string {
  if (typeof token.value === "string") return token.value;
  const v = token.value[theme];
  if (v === undefined) throw new Error(`Token ${token.name} sem valor para o tema ${theme}.`);
  return v;
}

function themeLines(t: DesignTokens, theme: string, indent: string): string[] {
  return [...t.color.tokens, ...t.shadow.tokens].map(
    (tok) => `${indent}--${tok.name}: ${themedValue(tok, theme)};`,
  );
}

function textRule(style: TextStyle, family: string): string {
  const parts = [
    `font-family: var(--font-${family});`,
    `font-size: ${style.fontSize};`,
    `line-height: ${style.lineHeight};`,
    `font-weight: ${style.fontWeight};`,
  ];
  if (style.letterSpacing) parts.push(`letter-spacing: ${style.letterSpacing};`);
  parts.push(...(TEXT_EXTRAS[style.name] ?? []));
  return `.text-${style.name} { ${parts.join(" ")} }`;
}

export function generateTokensCss(t: DesignTokens): string {
  const out: string[] = [];
  out.push(
    `/* ${t.name} — generated from tokens.json (design system "${t.name}", ${brDate(t.meta.synced)}). Não edite à mão: altere o tokens.json. */`,
    "",
    ":root {",
  );
  for (const tok of [...t.spacing.tokens, ...t.radius.tokens, ...t.size.tokens]) {
    out.push(`  --${tok.name}: ${staticValue(tok)};`);
  }
  for (const [family, stack] of Object.entries(t.type.families)) {
    out.push(`  --font-${family}: ${stack};`);
  }
  out.push("}", "");

  t.color.themes.forEach((theme, i) => {
    out.push(i === 0 ? `:root,\n[data-theme="${theme.id}"] {` : `[data-theme="${theme.id}"] {`);
    out.push(...themeLines(t, theme.id, "  "), "}", "");
  });

  out.push(
    "/* Sem tema escolhido + sistema em modo escuro → Noturno (DECISOES 09/11) */",
    "@media (prefers-color-scheme: dark) {",
    "  :root:not([data-theme]) {",
    ...themeLines(t, DARK_THEME, "    "),
    "  }",
    "}",
    "",
    "/* Estilos de texto */",
  );
  for (const group of t.type.groups) {
    for (const style of group.styles) out.push(textRule(style, group.family));
  }
  return out.join("\n") + "\n";
}
