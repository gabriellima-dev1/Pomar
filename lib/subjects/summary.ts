/**
 * Funções puras de apresentação das disciplinas (cards, Início, Disciplina).
 */

type PositionedTopic = { id: string; position: number; title: string; done_at: string | null };
type PositionedChapter<T extends PositionedTopic> = { position: number; topics: T[] };

/** Primeiro tópico não concluído, na ordem dos capítulos e tópicos. */
export function nextTopic<T extends PositionedTopic>(chapters: PositionedChapter<T>[]): T | null {
  const ordered = [...chapters].sort((a, b) => a.position - b.position);
  for (const chapter of ordered) {
    const topic = [...chapter.topics]
      .sort((a, b) => a.position - b.position)
      .find((t) => !t.done_at);
    if (topic) return topic;
  }
  return null;
}

/** "Thomas H. Cormen, Charles E. Leiserson" → "Cormen" (ou "Cormen et al." com `etAl`). */
export function shortAuthors(authors: string | null | undefined, etAl = false): string {
  const names = (authors ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const first = names[0];
  if (!first) return "";
  const surname = first.split(/\s+/).at(-1) ?? first;
  return etAl && names.length > 1 ? `${surname} et al.` : surname;
}

/** Partes da data/hora local no fuso do usuário. */
export function localParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday").replace("-feira", "");
  return {
    hour: Number(get("hour")) % 24,
    /** "Segunda, 9 de novembro". */
    dateLabel: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${get("day")} de ${get("month")}`,
  };
}

/** Bom dia (5–11h), boa tarde (12–17h), boa noite (18–4h). */
export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** "2026-12-02" → "02/12". */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** "~45 min", "~9h", "~3h30" (estimativa compacta para cards; acima de 1h, arredonda a 10 min). */
export function compactDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `~${total} min`;
  const rounded = Math.round(total / 10) * 10;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m === 0 ? `~${h}h` : `~${h}h${m}`;
}

/** "1. O papel dos algoritmos" → "1 · O papel dos algoritmos" (como no design). */
export function chapterLabel(title: string): string {
  return title.replace(/^(\d+|Apêndice [A-Z])\.\s+/, "$1 · ");
}

/** Sigla da "capa" do livro: iniciais dos sobrenomes (até 4), ex.: Cormen et al. → "CLRS". */
export function bookInitials(authors: string | null | undefined): string {
  const initials = (authors ?? "")
    .split(",")
    .map((n) => n.trim().split(/\s+/).at(-1)?.charAt(0) ?? "")
    .filter(Boolean)
    .slice(0, 4)
    .join("")
    .toUpperCase();
  return initials || "?";
}

const ACRONYM_SKIP = new Set(["de", "da", "do", "das", "dos", "e"]);

/**
 * Sigla do selo da disciplina (telas.md › Início como painel, 39d), gerada do título:
 * com 2 ou mais palavras (sem de/da/do/das/dos/e), as iniciais de até 3; com uma, as 3
 * primeiras letras. Maiúsculas, com acento. "Estruturas de Dados" → "ED", "Algoritmos" → "ALG".
 */
export function subjectAcronym(title: string): string {
  const words = title.match(/[\p{L}\p{N}]+/gu) ?? [];
  const kept = words.filter((w) => !ACRONYM_SKIP.has(w.toLocaleLowerCase("pt-BR")));
  const use = kept.length > 0 ? kept : words;
  const raw =
    use.length === 0
      ? "?"
      : use.length === 1
        ? Array.from(use[0]!).slice(0, 3).join("")
        : use
            .slice(0, 3)
            .map((w) => Array.from(w)[0])
            .join("");
  return raw.toLocaleUpperCase("pt-BR");
}
