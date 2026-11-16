/**
 * Contraste WCAG 2.x com cores translúcidas: o vidro do painel do pomodoro é rgba, então
 * a cor de fundo real é a composição dele sobre a cena (telas.md › Pomodoro no computador:
 * "Conferir contraste AA de todos os textos").
 */

export type Rgba = { r: number; g: number; b: number; a: number };

/** Lê `#rgb`, `#rrggbb` ou `rgba(r,g,b,a)` / `rgb(r,g,b)`. */
export function parseColor(value: string): Rgba {
  const v = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
  if (hex) {
    const h = hex[1]!.length === 3 ? [...hex[1]!].map((ch) => ch + ch).join("") : hex[1]!;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  const fn = /^rgba?\(([^)]+)\)$/.exec(v);
  if (fn) {
    const [r, g, b, a = "1"] = fn[1]!.split(",").map((s) => s.trim());
    return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) };
  }
  throw new Error(`Cor não reconhecida: ${value}`);
}

/** Composição "source-over" de `top` sobre um fundo opaco. */
export function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

/** Compõe as camadas de cima para baixo: `flatten(texto?, vidro, cena)`. */
export function flatten(...layers: (Rgba | string)[]): Rgba {
  const parsed = layers.map((l) => (typeof l === "string" ? parseColor(l) : l));
  let acc = parsed[parsed.length - 1]!;
  if (acc.a < 1) throw new Error("A última camada precisa ser opaca.");
  for (let i = parsed.length - 2; i >= 0; i--) acc = over(parsed[i]!, acc);
  return acc;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(c: Rgba): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/** Razão de contraste entre duas cores opacas (1 a 21). */
export function contrastRatio(a: Rgba | string, b: Rgba | string): number {
  const la = luminance(typeof a === "string" ? parseColor(a) : a);
  const lb = luminance(typeof b === "string" ? parseColor(b) : b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
