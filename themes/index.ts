import { THEME_CODES, type ThemeCode } from "@/lib/gamification/themes";
import { classico } from "./classico";
import { halloween } from "./halloween";
import { natal } from "./natal";
import { noturno } from "./noturno";
import type { ThemeConfig } from "./types";

export type { ThemeConfig } from "./types";

export const THEMES: Record<ThemeCode, ThemeConfig> = { classico, noturno, halloween, natal };

export const THEME_LIST: ThemeConfig[] = THEME_CODES.map((code) => THEMES[code]);
