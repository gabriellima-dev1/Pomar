/**
 * Histórico de estudo por disciplina, a partir dos pomodoros concluídos.
 * Base da previsão de término (DESIGN §4.3) e da ordem dos cards ("última estudada").
 */
import { addDays, localDay } from "@/lib/dates";
import { dailyFocusAverage } from "@/lib/estimates";

export type SessionForHistory = {
  subject_id: string | null;
  started_at: string;
  ended_at: string | null;
  paused_sec: number;
};

export type SubjectHistory = {
  lastEndedAt: string;
  firstDay: string;
  days: { day: string; minutes: number }[];
};

export function summarizeHistory(
  sessions: SessionForHistory[],
  timeZone: string,
): Map<string, SubjectHistory> {
  const map = new Map<string, SubjectHistory>();
  for (const s of sessions) {
    if (!s.subject_id || !s.ended_at) continue;
    const minutes =
      (Date.parse(s.ended_at) - Date.parse(s.started_at)) / 60_000 - s.paused_sec / 60;
    const day = localDay(new Date(s.ended_at), timeZone);
    const h = map.get(s.subject_id);
    if (!h) {
      map.set(s.subject_id, { lastEndedAt: s.ended_at, firstDay: day, days: [{ day, minutes }] });
      continue;
    }
    if (s.ended_at > h.lastEndedAt) h.lastEndedAt = s.ended_at;
    if (day < h.firstDay) h.firstDay = day;
    const entry = h.days.find((d) => d.day === day);
    if (entry) entry.minutes += minutes;
    else h.days.push({ day, minutes });
  }
  return map;
}

/** Dia previsto de término (AAAA-MM-DD), ou `null` sem histórico ou sem nada a fazer. */
export function forecastDay(
  remainingMin: number,
  history: SubjectHistory | undefined,
  today: string,
): string | null {
  if (!history || remainingMin <= 0) return null;
  const avg = dailyFocusAverage(history.days, today, history.firstDay);
  if (avg <= 0) return null;
  return addDays(today, Math.ceil(remainingMin / avg - 1e-9));
}
