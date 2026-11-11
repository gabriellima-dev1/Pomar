import "server-only";
import { cache } from "react";
import { addDays, localDay } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { BadgeDay } from "./present";
import { displayStreak, freezeUsedYesterday } from "./streak";
import { isThemeCode, type ThemeCode } from "./themes";
import type { Tier } from "./harvest";

/**
 * Leituras da gamificação para as telas (sessão do usuário: a RLS filtra).
 * Tudo aqui foi calculado no servidor; o cliente só exibe.
 */

export type GameProfile = {
  xp: number;
  level: number;
  levelSeen: number;
  /** Ofensiva mostrada (dias fechados + hoje, se já houve pomodoro). */
  streak: number;
  freezes: number;
  timezone: string;
  today: string;
  studiedToday: boolean;
  /** Ontem não teve pomodoro e um congelamento guardou a ofensiva. */
  freezeUsed: boolean;
  /** Tema escolhido (null = automático). */
  theme: ThemeCode | null;
  isAdmin: boolean;
};

export const getGameProfile = cache(async (userId: string): Promise<GameProfile> => {
  const supabase = await createClient();
  const [{ data: p }, { data: recent }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "timezone, xp_total, level, level_seen, streak_current, freezes, last_closed_day, theme, is_admin",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("pomodoro_sessions")
      .select("ended_at")
      .eq("status", "completed")
      .gte("ended_at", new Date(Date.now() - 2 * 86_400_000).toISOString()),
  ]);
  const timezone = p?.timezone ?? "America/Maceio";
  const today = localDay(new Date(), timezone);
  const yesterday = addDays(today, -1);
  const days = new Set(
    (recent ?? []).map((s) => (s.ended_at ? localDay(new Date(s.ended_at), timezone) : "")),
  );
  const studiedToday = days.has(today);
  const closed = p?.streak_current ?? 0;
  return {
    xp: p?.xp_total ?? 0,
    level: p?.level ?? 1,
    levelSeen: p?.level_seen ?? 1,
    streak: displayStreak(closed, studiedToday),
    freezes: p?.freezes ?? 0,
    timezone,
    today,
    studiedToday,
    freezeUsed: freezeUsedYesterday(closed, days.has(yesterday), p?.last_closed_day === yesterday),
    theme: isThemeCode(p?.theme) ? p.theme : null,
    isAdmin: p?.is_admin ?? false,
  };
});

export type BadgeHistoryItem = BadgeDay & { seen: boolean };

export const getBadgeHistory = cache(async (): Promise<BadgeHistoryItem[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_daily_badges")
    .select("day, badge_code, seen_at")
    .order("day");
  return (data ?? []).map((b) => ({ day: b.day, code: b.badge_code, seen: b.seen_at !== null }));
});

export type HarvestItem = { weekStart: string; tier: Tier; days: number };

export const getHarvests = cache(async (): Promise<HarvestItem[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_harvests")
    .select("week_start, tier, days")
    .order("week_start", { ascending: false });
  return (data ?? []).map((h) => ({ weekStart: h.week_start, tier: h.tier as Tier, days: h.days }));
});

export type UnlockedTheme = {
  code: ThemeCode;
  sourceWeek: string | null;
  seen: boolean;
  tabSeen: boolean;
};

export const getUnlockedThemes = cache(async (): Promise<UnlockedTheme[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_themes")
    .select("theme_code, source_week, seen_at, tab_seen_at")
    .order("unlocked_at");
  return (data ?? [])
    .filter((t) => isThemeCode(t.theme_code))
    .map((t) => ({
      code: t.theme_code as ThemeCode,
      sourceWeek: t.source_week,
      seen: t.seen_at !== null,
      tabSeen: t.tab_seen_at !== null,
    }));
});
