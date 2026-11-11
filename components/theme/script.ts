import type { ThemeCode } from "@/lib/gamification/themes";

/** Script inline: aplica o tema antes da primeira pintura (sem piscar ao recarregar). */
export function themeScript(theme: ThemeCode | null): string {
  return theme
    ? `document.documentElement.setAttribute("data-theme",${JSON.stringify(theme)})`
    : `document.documentElement.removeAttribute("data-theme")`;
}
