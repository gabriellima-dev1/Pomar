import type { ThemePreference } from "@/lib/gamification/themes";

/** Script inline: aplica o tema antes da primeira pintura (sem piscar ao recarregar). */
export function themeScript(theme: ThemePreference): string {
  return `document.documentElement.setAttribute("data-theme",${JSON.stringify(theme)})`;
}
