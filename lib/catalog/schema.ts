/**
 * Formato e validação dos livros do catálogo (supabase/seed/catalog/*.json).
 * Sem imports com alias: também é usado pelos scripts em scripts/ (Node puro).
 *
 * Convenção de páginas: `páginas = page_end − page_start + 1`; tópicos não se
 * sobrepõem (o `page_end` de um tópico é menor que o `page_start` do seguinte).
 */

export type CatalogTopic = {
  title: string;
  page_start: number;
  page_end: number;
};

export type CatalogChapter = {
  title: string;
  topics: CatalogTopic[];
};

export type CatalogBook = {
  slug: string;
  title: string;
  authors: string[];
  edition: string;
  publisher: string;
  year: number;
  isbn: string | null;
  total_pages: number | null;
  verified: boolean;
  source_note: string;
  chapters: CatalogChapter[];
};

export type ValidationResult = { ok: true; book: CatalogBook } | { ok: false; errors: string[] };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_TITLE = 200;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function checkTitle(value: unknown, where: string, errors: string[]): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${where}: título vazio ou ausente`);
    return false;
  }
  if (value.length > MAX_TITLE) {
    errors.push(`${where}: título com mais de ${MAX_TITLE} caracteres`);
    return false;
  }
  return true;
}

/** Valida um livro do seed. Devolve todos os erros encontrados, não só o primeiro. */
export function validateCatalogBook(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(input)) return { ok: false, errors: ["o livro precisa ser um objeto"] };

  const b = input;
  if (typeof b.slug !== "string" || !SLUG_RE.test(b.slug)) {
    errors.push("slug inválido (use letras minúsculas, números e hífens)");
  }
  const label = typeof b.slug === "string" ? b.slug : "livro";
  checkTitle(b.title, `${label}`, errors);
  if (
    !Array.isArray(b.authors) ||
    b.authors.length === 0 ||
    b.authors.some((a) => typeof a !== "string" || a.trim() === "")
  ) {
    errors.push(`${label}: authors precisa ser uma lista de nomes`);
  }
  if (typeof b.edition !== "string" || b.edition.trim() === "") {
    errors.push(`${label}: edition ausente`);
  }
  if (typeof b.publisher !== "string" || b.publisher.trim() === "") {
    errors.push(`${label}: publisher ausente`);
  }
  if (!isPositiveInt(b.year) || b.year < 1900 || b.year > 2100) {
    errors.push(`${label}: year inválido`);
  }
  if (b.isbn !== null && (typeof b.isbn !== "string" || !/^[0-9X-]{10,17}$/.test(b.isbn))) {
    errors.push(`${label}: isbn inválido (use null se não souber)`);
  }
  if (b.total_pages !== null && !isPositiveInt(b.total_pages)) {
    errors.push(`${label}: total_pages precisa ser inteiro positivo ou null`);
  }
  if (typeof b.verified !== "boolean") errors.push(`${label}: verified precisa ser booleano`);
  if (typeof b.source_note !== "string" || b.source_note.length > 1000) {
    errors.push(`${label}: source_note ausente ou com mais de 1000 caracteres`);
  }

  if (!Array.isArray(b.chapters) || b.chapters.length === 0) {
    errors.push(`${label}: o livro precisa de ao menos um capítulo`);
    return { ok: false, errors };
  }

  let lastEnd = 0;
  b.chapters.forEach((chapter: unknown, ci: number) => {
    const where = `${label} › cap. ${ci + 1}`;
    if (!isObject(chapter)) {
      errors.push(`${where}: capítulo precisa ser um objeto`);
      return;
    }
    checkTitle(chapter.title, where, errors);
    if (!Array.isArray(chapter.topics) || chapter.topics.length === 0) {
      errors.push(`${where}: o capítulo precisa de ao menos um tópico`);
      return;
    }
    chapter.topics.forEach((topic: unknown, ti: number) => {
      const tw = `${where} › tópico ${ti + 1}`;
      if (!isObject(topic)) {
        errors.push(`${tw}: tópico precisa ser um objeto`);
        return;
      }
      checkTitle(topic.title, tw, errors);
      const { page_start: start, page_end: end } = topic;
      if (!isPositiveInt(start) || !isPositiveInt(end)) {
        errors.push(`${tw}: page_start e page_end precisam ser inteiros ≥ 1`);
        return;
      }
      if (end < start) errors.push(`${tw}: page_end (${end}) menor que page_start (${start})`);
      if (start <= lastEnd) {
        errors.push(`${tw}: começa na pág. ${start}, mas o tópico anterior vai até a ${lastEnd}`);
      }
      if (typeof b.total_pages === "number" && end > b.total_pages) {
        errors.push(`${tw}: termina na pág. ${end}, depois do total do livro (${b.total_pages})`);
      }
      lastEnd = Math.max(lastEnd, end);
    });
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, book: input as CatalogBook };
}

export function topicPageCount(topic: Pick<CatalogTopic, "page_start" | "page_end">): number {
  return topic.page_end - topic.page_start + 1;
}

export function chapterPageCount(chapter: CatalogChapter): number {
  return chapter.topics.reduce((sum, t) => sum + topicPageCount(t), 0);
}

export function bookPageCount(book: CatalogBook): number {
  return book.chapters.reduce((sum, c) => sum + chapterPageCount(c), 0);
}
