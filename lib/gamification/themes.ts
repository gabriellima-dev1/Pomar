/** Regras dos temas (DESIGN.md §6.7). A parte visual fica em themes/*.ts. */

export const THEME_CODES = ["classico", "noturno", "halloween", "natal"] as const;
export type ThemeCode = (typeof THEME_CODES)[number];

/** Clássico e Noturno são livres; Halloween e Natal vêm das colheitas. */
export const FREE_THEMES: readonly ThemeCode[] = ["classico", "noturno"];

export function isThemeCode(value: unknown): value is ThemeCode {
  return typeof value === "string" && (THEME_CODES as readonly string[]).includes(value);
}

/**
 * Pode usar o tema? Livres sempre; conquistados ficam para sempre; a flag de admin
 * (`is_admin`) libera todos para a conta de demonstração.
 */
export function canUseTheme(
  code: ThemeCode,
  unlocked: ReadonlySet<string>,
  isAdmin: boolean,
): boolean {
  return isAdmin || FREE_THEMES.includes(code) || unlocked.has(code);
}

/** Tema sugerido na estação (Kairos): outubro → Halloween, dezembro → Natal. */
export function seasonalTheme(month: number): ThemeCode | null {
  if (month === 10) return "halloween";
  if (month === 12) return "natal";
  return null;
}

/** Tema efetivo: o escolhido, ou o automático (Noturno no modo escuro). */
export function effectiveTheme(chosen: ThemeCode | null, prefersDark: boolean): ThemeCode {
  return chosen ?? (prefersDark ? "noturno" : "classico");
}
