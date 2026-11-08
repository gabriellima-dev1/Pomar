/**
 * Eventos de telemetria do DESIGN.md §9.1.
 * Mesma lista do `check` em supabase/migrations/*_telemetria.sql:
 * adicionar um evento aqui exige uma migração nova.
 */
export const EVENT_NAMES = [
  "landing_viewed",
  "signup_completed",
  "onboarding_quiz_completed",
  "league_opt_in_choice",
  "subject_created",
  "calibration_completed",
  "pomodoro_started",
  "pomodoro_paused",
  "pause_nudge_shown",
  "pause_nudge_choice",
  "pomodoro_completed",
  "pomodoro_cancelled",
  "pages_logged",
  "topic_completed",
  "badge_awarded",
  "harvest_awarded",
  "level_up",
  "theme_changed",
  "follow_created",
  "reaction_sent",
  "notification_shown",
  "notification_clicked",
  "app_opened",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export type EventProps = Record<string, string | number | boolean | null>;

const EVENT_SET: ReadonlySet<string> = new Set(EVENT_NAMES);

export function isEventName(value: unknown): value is EventName {
  return typeof value === "string" && EVENT_SET.has(value);
}
