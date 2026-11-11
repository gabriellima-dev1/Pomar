/**
 * Resumo do foco para os cards de destaque do Início (tela 21): minutos hoje e na
 * semana (segunda a domingo, fuso do usuário) e pomodoros de hoje por disciplina.
 */
import { localDay, weekStart } from "@/lib/dates";

export type FocusSession = {
  subject_id: string | null;
  started_at: string;
  ended_at: string | null;
  paused_sec: number;
};

export type FocusSummary = {
  todayMin: number;
  weekMin: number;
  /** Pomodoros concluídos hoje por disciplina (meta diária). */
  todayBySubject: Map<string, number>;
};

/** `sessions` = ciclos concluídos (inclusive sessões livres). */
export function focusSummary(
  sessions: readonly FocusSession[],
  timeZone: string,
  today: string,
): FocusSummary {
  const monday = weekStart(today);
  let todayMin = 0;
  let weekMin = 0;
  const todayBySubject = new Map<string, number>();
  for (const s of sessions) {
    if (!s.ended_at) continue;
    const day = localDay(new Date(s.ended_at), timeZone);
    if (day < monday || day > today) continue;
    const minutes = Math.max(
      0,
      (Date.parse(s.ended_at) - Date.parse(s.started_at)) / 60_000 - s.paused_sec / 60,
    );
    weekMin += minutes;
    if (day === today) {
      todayMin += minutes;
      if (s.subject_id) {
        todayBySubject.set(s.subject_id, (todayBySubject.get(s.subject_id) ?? 0) + 1);
      }
    }
  }
  return { todayMin: Math.round(todayMin), weekMin: Math.round(weekMin), todayBySubject };
}

/** "45 min", "1 h 05 min". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")} min`;
}
