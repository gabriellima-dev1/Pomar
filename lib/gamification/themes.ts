/** Regras dos temas (DESIGN.md §6.7). A parte visual fica em themes/*.ts. */

export const THEME_CODES = ["classico", "noturno", "halloween", "natal"] as const;
export type ThemeCode = (typeof THEME_CODES)[number];

/** Clássico e Noturno são livres; Halloween e Natal vêm das colheitas. */
export const FREE_THEMES: readonly ThemeCode[] = ["classico", "noturno"];

export function isThemeCode(value: unknown): value is ThemeCode {
  return typeof value === "string" && (THEME_CODES as readonly string[]).includes(value);
}

/**
 * Preferência gravada em `profiles.theme`: um tema, ou `auto` = seguir o modo escuro do
 * aparelho (Clássico de dia, Noturno no escuro). O padrão é o Clássico; o automático
 * só vale para quem escolher (decisão da dupla, 11/11).
 */
export type ThemePreference = ThemeCode | "auto";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "auto" || isThemeCode(value);
}

export function parseThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : "classico";
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

/** Tema que está valendo: o escolhido, ou no automático o Noturno com o aparelho escuro. */
export function effectiveTheme(pref: ThemePreference, prefersDark: boolean): ThemeCode {
  if (pref === "auto") return prefersDark ? "noturno" : "classico";
  return pref;
}
