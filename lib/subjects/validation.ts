/**
 * Validação dos formulários de disciplina. Funções puras: rodam no servidor
 * (Server Actions) antes de chamar o banco; o banco repete os limites em `check`.
 */
import { isSubjectColor, type SubjectColor } from "./colors";

export const TITLE_MAX = 120;
export const ITEM_TITLE_MAX = 200;
export const PAGE_MAX = 20000;
export const DAILY_GOAL_MAX = 20;
export const MAX_CHAPTERS = 100;
export const MAX_TOPICS_PER_CHAPTER = 200;

export type FieldErrors = Partial<Record<string, string>>;

export type SubjectFields = {
  title: string;
  color: SubjectColor;
  goalDate: string | null;
  dailyGoal: number | null;
};

export type ManualTopic = { title: string; page_start: number; page_end: number };
export type ManualChapter = { title: string; topics: ManualTopic[] };

type Parsed<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Título, cor, data da prova (opcional) e meta diária de pomodoros (opcional). */
export function parseSubjectFields(input: {
  title: unknown;
  color: unknown;
  goalDate: unknown;
  dailyGoal: unknown;
}): Parsed<SubjectFields> {
  const errors: FieldErrors = {};
  const title = text(input.title);
  if (!title) errors.title = "Dê um nome para a disciplina.";
  else if (title.length > TITLE_MAX) errors.title = `Use até ${TITLE_MAX} caracteres.`;

  const color = text(input.color);
  if (!isSubjectColor(color)) errors.color = "Escolha uma cor.";

  const goalText = text(input.goalDate);
  const goalDate = goalText === "" ? null : goalText;
  if (goalDate !== null && !isValidDate(goalDate)) errors.goalDate = "Data inválida.";

  const goalNumber = text(input.dailyGoal);
  let dailyGoal: number | null = null;
  if (goalNumber !== "") {
    const n = /^\d+$/.test(goalNumber) ? Number(goalNumber) : NaN;
    if (!Number.isInteger(n) || n < 1 || n > DAILY_GOAL_MAX) {
      errors.dailyGoal = `Use um número de 1 a ${DAILY_GOAL_MAX}.`;
    } else {
      dailyGoal = n;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { title, color: color as SubjectColor, goalDate, dailyGoal } };
}

function parsePage(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

/** Páginas inicial e final de um tópico. */
export function parsePageRange(
  start: unknown,
  end: unknown,
): { ok: true; page_start: number; page_end: number } | { ok: false; error: string } {
  const s = parsePage(start);
  const e = parsePage(end);
  if (s === null || e === null) return { ok: false, error: "Informe as páginas inicial e final." };
  if (s < 1 || e < 1 || s > PAGE_MAX || e > PAGE_MAX) {
    return { ok: false, error: `As páginas vão de 1 a ${PAGE_MAX}.` };
  }
  if (e < s) return { ok: false, error: "A página final não pode vir antes da inicial." };
  return { ok: true, page_start: s, page_end: e };
}

export function parseItemTitle(
  value: unknown,
  what: "capítulo" | "tópico",
): { ok: true; title: string } | { ok: false; error: string } {
  const title = text(value);
  if (!title) return { ok: false, error: `Dê um nome para o ${what}.` };
  if (title.length > ITEM_TITLE_MAX)
    return { ok: false, error: `Use até ${ITEM_TITLE_MAX} caracteres.` };
  return { ok: true, title };
}

/**
 * Estrutura da disciplina manual, enviada pelo formulário como JSON.
 * Erros têm chaves `estrutura`, `cap-<i>` e `top-<i>-<j>` (índices a partir de 0).
 */
export function parseManualStructure(json: unknown): Parsed<ManualChapter[]> {
  let data: unknown;
  try {
    data = typeof json === "string" ? JSON.parse(json) : null;
  } catch {
    data = null;
  }
  if (!Array.isArray(data) || data.length === 0) {
    return { ok: false, errors: { estrutura: "Crie ao menos um capítulo com um tópico." } };
  }
  if (data.length > MAX_CHAPTERS) {
    return { ok: false, errors: { estrutura: `Use até ${MAX_CHAPTERS} capítulos.` } };
  }

  const errors: FieldErrors = {};
  const chapters: ManualChapter[] = [];

  data.forEach((raw: unknown, ci) => {
    const chapter = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const title = parseItemTitle(chapter.title, "capítulo");
    if (!title.ok) errors[`cap-${ci}`] = title.error;

    const rawTopics = Array.isArray(chapter.topics) ? chapter.topics : [];
    if (rawTopics.length === 0) {
      errors[`cap-${ci}`] ??= "Adicione ao menos um tópico.";
    } else if (rawTopics.length > MAX_TOPICS_PER_CHAPTER) {
      errors[`cap-${ci}`] ??= `Use até ${MAX_TOPICS_PER_CHAPTER} tópicos por capítulo.`;
    }

    const topics: ManualTopic[] = [];
    rawTopics.slice(0, MAX_TOPICS_PER_CHAPTER).forEach((rawTopic: unknown, ti) => {
      const topic = (typeof rawTopic === "object" && rawTopic !== null ? rawTopic : {}) as Record<
        string,
        unknown
      >;
      const tTitle = parseItemTitle(topic.title, "tópico");
      const range = parsePageRange(topic.page_start, topic.page_end);
      if (!tTitle.ok) errors[`top-${ci}-${ti}`] = tTitle.error;
      else if (!range.ok) errors[`top-${ci}-${ti}`] = range.error;
      if (tTitle.ok && range.ok) {
        topics.push({
          title: tTitle.title,
          page_start: range.page_start,
          page_end: range.page_end,
        });
      }
    });

    if (title.ok) chapters.push({ title: title.title, topics });
  });

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: chapters };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** IDs de tópicos marcados no formulário do catálogo (sem duplicados, só UUIDs). */
export function parseTopicIds(values: unknown[]): string[] {
  return [...new Set(values.filter(isUuid).map((v) => v.toLowerCase()))];
}
