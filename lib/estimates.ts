/**
 * Estimativas de tempo (DESIGN.md §4.3). Funções puras.
 *
 * - minutos_tópico = páginas × min_por_página (ou duração ÷ velocidade em vídeos)
 * - pomodoros = ceil(minutos ÷ foco)
 * - previsão de término = minutos restantes ÷ média diária de foco (últimos 14 dias)
 */

/** Ritmo usado enquanto não há calibração (decisão da dupla, 08/11). */
export const DEFAULT_MIN_PER_PAGE = 3;

export type PaceSource = "disciplina" | "global" | "padrao";

export type Pace = { minPerPage: number; source: PaceSource };

export type EstimateTopic = {
  page_start: number | null;
  page_end: number | null;
  duration_sec?: number | null;
  done_at?: string | null;
};

function positive(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Ritmo da disciplina → padrão global do usuário → 3 min/página. */
export function effectivePace(subjectPace: number | null, globalPace: number | null): Pace {
  if (positive(subjectPace)) return { minPerPage: subjectPace, source: "disciplina" };
  if (positive(globalPace)) return { minPerPage: globalPace, source: "global" };
  return { minPerPage: DEFAULT_MIN_PER_PAGE, source: "padrao" };
}

export function paceLabel(pace: Pace): string {
  const value = formatPace(pace.minPerPage);
  switch (pace.source) {
    case "disciplina":
      return `${value} por página (calibrado nesta disciplina)`;
    case "global":
      return `${value} por página (seu ritmo padrão)`;
    case "padrao":
      return `${value} por página — estimativa padrão, calibre para ajustar`;
  }
}

export function formatPace(minPerPage: number): string {
  const rounded = Math.round(minPerPage * 10) / 10;
  return `${rounded.toLocaleString("pt-BR")} min`;
}

export function topicPages(topic: Pick<EstimateTopic, "page_start" | "page_end">): number {
  const { page_start: start, page_end: end } = topic;
  if (start == null || end == null || end < start) return 0;
  return end - start + 1;
}

/** Minutos estimados de um tópico (vídeo: duração ÷ velocidade; livro: páginas × ritmo). */
export function topicMinutes(topic: EstimateTopic, minPerPage: number, videoSpeed = 1): number {
  if (positive(topic.duration_sec)) {
    const speed = positive(videoSpeed) ? videoSpeed : 1;
    return topic.duration_sec / 60 / speed;
  }
  return topicPages(topic) * minPerPage;
}

export function pomodorosFor(minutes: number, focusMin: number): number {
  if (!positive(minutes) || !positive(focusMin)) return 0;
  return Math.ceil(minutes / focusMin - 1e-9);
}

export type ProgressUnit = "paginas" | "minutos";

export type SubjectProgress = {
  unit: ProgressUnit;
  total: number;
  done: number;
  remaining: number;
  /** 0–100, arredondado para baixo (100 só quando tudo foi concluído). */
  percent: number;
  topicsTotal: number;
  topicsDone: number;
};

function topicAmount(topic: EstimateTopic, unit: ProgressUnit): number {
  if (unit === "minutos") return positive(topic.duration_sec) ? topic.duration_sec / 60 : 0;
  return topicPages(topic);
}

/** Progresso por páginas (livros) ou minutos (vídeos). Sem páginas, conta tópicos. */
export function subjectProgress(topics: EstimateTopic[], unit: ProgressUnit): SubjectProgress {
  let total = 0;
  let done = 0;
  let topicsDone = 0;
  for (const t of topics) {
    const amount = topicAmount(t, unit);
    total += amount;
    if (t.done_at) {
      done += amount;
      topicsDone += 1;
    }
  }
  const topicsTotal = topics.length;
  const ratio = total > 0 ? done / total : topicsTotal > 0 ? topicsDone / topicsTotal : 0;
  const allDone = topicsTotal > 0 && topicsDone === topicsTotal;
  const percent = allDone ? 100 : Math.min(99, Math.floor(ratio * 100));
  return {
    unit,
    total: Math.round(total),
    done: Math.round(done),
    remaining: Math.round(total - done),
    percent,
    topicsTotal,
    topicsDone,
  };
}

/** Minutos estimados dos tópicos ainda não concluídos. */
export function remainingMinutes(
  topics: EstimateTopic[],
  minPerPage: number,
  videoSpeed = 1,
): number {
  return topics
    .filter((t) => !t.done_at)
    .reduce((sum, t) => sum + topicMinutes(t, minPerPage, videoSpeed), 0);
}

/**
 * Data prevista de término, ou `null` sem histórico de foco.
 * `today` é a data local do usuário (só a parte de data importa).
 */
export function forecastFinish(
  remainingMin: number,
  dailyFocusAvgMin: number,
  today: Date,
): Date | null {
  if (!positive(dailyFocusAvgMin)) return null;
  const days = remainingMin > 0 ? Math.ceil(remainingMin / dailyFocusAvgMin - 1e-9) : 0;
  const result = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** "45 min", "2 h", "3 h 20 min". Arredonda para o minuto. */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
