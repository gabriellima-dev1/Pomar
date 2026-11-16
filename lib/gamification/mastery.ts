/**
 * Motivação intrínseca × extrínseca (DESIGN §3, superjustificação): a partir do nível 10,
 * o Início destaca o que a pessoa domina (tópicos e capítulos concluídos) e o XP perde o
 * destaque visual. As celebrações de nível continuam.
 */

export const MASTERY_LEVEL = 10;

export function masteryMode(level: number): boolean {
  return level >= MASTERY_LEVEL;
}

type Chapter = { topics: { done_at: string | null }[] };

/** Tópicos concluídos e capítulos com todos os tópicos concluídos. */
export function masteryCounts(subjects: { chapters: Chapter[] }[]): {
  topics: number;
  chapters: number;
} {
  let topics = 0;
  let chapters = 0;
  for (const s of subjects) {
    for (const ch of s.chapters) {
      const done = ch.topics.filter((t) => t.done_at !== null).length;
      topics += done;
      if (ch.topics.length > 0 && done === ch.topics.length) chapters += 1;
    }
  }
  return { topics, chapters };
}
