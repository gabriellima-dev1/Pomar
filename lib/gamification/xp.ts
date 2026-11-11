/**
 * XP (DESIGN.md §6.1). Calculado só no servidor, a partir das sessões e dos tópicos
 * gravados; o cliente nunca envia valores. Cada ganho vira um evento com uma chave
 * única (`dedupe_key`): repetir a mesma conta não soma de novo.
 */

export type XpSource = "pomodoro" | "first_of_day" | "topic" | "chapter" | "subject";

export type XpEvent = {
  source: XpSource;
  amount: number;
  ref_id: string | null;
  dedupe_key: string;
};

export const FIRST_OF_DAY_XP = 5;
export const TOPIC_XP_MAX = 20;
export const CHAPTER_XP = 15;
export const SUBJECT_XP = 100;

/** Pomodoro concluído: round(10 × foco ÷ 25) — 25 min = 10 XP. */
export function pomodoroXp(focusMin: number): number {
  return Math.max(0, Math.round((10 * focusMin) / 25));
}

/** Tópico concluído: +1 por página ou +1 a cada 5 min de vídeo, até +20. */
export function topicXp(topic: {
  page_start: number | null;
  page_end: number | null;
  duration_sec: number | null;
}): number {
  if (topic.duration_sec != null && topic.duration_sec > 0) {
    return Math.min(TOPIC_XP_MAX, Math.floor(topic.duration_sec / 300));
  }
  const { page_start: start, page_end: end } = topic;
  if (start == null || end == null || end < start) return 0;
  return Math.min(TOPIC_XP_MAX, end - start + 1);
}

/** Eventos de um pomodoro concluído. `day` = dia local do fim do ciclo. */
export function pomodoroAwards(input: {
  sessionId: string;
  plannedFocusSec: number;
  day: string;
  /** Não havia outro pomodoro concluído nesse dia antes deste. */
  firstOfDay: boolean;
}): XpEvent[] {
  const events: XpEvent[] = [
    {
      source: "pomodoro",
      amount: pomodoroXp(input.plannedFocusSec / 60),
      ref_id: input.sessionId,
      dedupe_key: `pomodoro:${input.sessionId}`,
    },
  ];
  if (input.firstOfDay) {
    events.push({
      source: "first_of_day",
      amount: FIRST_OF_DAY_XP,
      ref_id: input.sessionId,
      dedupe_key: `first_of_day:${input.day}`,
    });
  }
  return events;
}

export type CompletionState = {
  /** A disciplina já tem pelo menos 1 pomodoro concluído (trava contra XP fabricado). */
  subjectHasPomodoro: boolean;
  subjectId: string;
  topic: {
    id: string;
    page_start: number | null;
    page_end: number | null;
    duration_sec: number | null;
    done: boolean;
  };
  chapter: { id: string; allDone: boolean };
  subjectAllDone: boolean;
};

/**
 * Eventos ao concluir um tópico: o tópico, o capítulo (se ficou completo) e a
 * disciplina (se ficou completa). Cada item dá XP uma única vez (a chave impede
 * repetir quem marca e desmarca); desmarcar não tira XP. Só vale se a disciplina
 * já tiver um pomodoro concluído (decisão da dupla, plano da Fase 3).
 */
export function completionAwards(state: CompletionState): XpEvent[] {
  if (!state.subjectHasPomodoro || !state.topic.done) return [];
  const events: XpEvent[] = [];
  const amount = topicXp(state.topic);
  if (amount > 0) {
    events.push({
      source: "topic",
      amount,
      ref_id: state.topic.id,
      dedupe_key: `topic:${state.topic.id}`,
    });
  }
  if (state.chapter.allDone) {
    events.push({
      source: "chapter",
      amount: CHAPTER_XP,
      ref_id: state.chapter.id,
      dedupe_key: `chapter:${state.chapter.id}`,
    });
  }
  if (state.subjectAllDone) {
    events.push({
      source: "subject",
      amount: SUBJECT_XP,
      ref_id: state.subjectId,
      dedupe_key: `subject:${state.subjectId}`,
    });
  }
  return events;
}

export function sumXp(events: Pick<XpEvent, "amount">[]): number {
  return events.reduce((acc, e) => acc + e.amount, 0);
}
