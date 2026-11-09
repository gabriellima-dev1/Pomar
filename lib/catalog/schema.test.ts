import { describe, expect, it } from "vitest";
import { loadCatalog } from "./load.ts";
import { bookPageCount, topicPageCount, validateCatalogBook, type CatalogBook } from "./schema.ts";

function book(overrides: Partial<CatalogBook> = {}): CatalogBook {
  return {
    slug: "livro-teste",
    title: "Livro Teste",
    authors: ["Fulana"],
    edition: "1ª ed.",
    publisher: "Editora",
    year: 2020,
    isbn: null,
    total_pages: 100,
    verified: false,
    source_note: "teste",
    chapters: [
      {
        title: "Cap. 1",
        topics: [
          { title: "1.1", page_start: 1, page_end: 9 },
          { title: "1.2", page_start: 10, page_end: 20 },
        ],
      },
      { title: "Cap. 2", topics: [{ title: "2.1", page_start: 21, page_end: 40 }] },
    ],
    ...overrides,
  };
}

describe("validateCatalogBook", () => {
  it("aceita um livro válido", () => {
    expect(validateCatalogBook(book()).ok).toBe(true);
  });

  it("rejeita slug inválido", () => {
    const r = validateCatalogBook(book({ slug: "Livro Teste" }));
    expect(r.ok).toBe(false);
  });

  it("rejeita página final antes da inicial", () => {
    const r = validateCatalogBook(
      book({ chapters: [{ title: "C", topics: [{ title: "T", page_start: 10, page_end: 5 }] }] }),
    );
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.errors.join()).toMatch(/menor que page_start/);
  });

  it("rejeita sobreposição entre tópicos, inclusive entre capítulos", () => {
    const r = validateCatalogBook(
      book({
        chapters: [
          { title: "A", topics: [{ title: "a", page_start: 1, page_end: 10 }] },
          { title: "B", topics: [{ title: "b", page_start: 10, page_end: 12 }] },
        ],
      }),
    );
    expect(r.ok).toBe(false);
  });

  it("rejeita página além do total do livro", () => {
    const r = validateCatalogBook(book({ total_pages: 30 }));
    expect(r.ok).toBe(false);
  });

  it("aceita total_pages e isbn nulos", () => {
    expect(validateCatalogBook(book({ total_pages: null, isbn: null })).ok).toBe(true);
  });

  it("rejeita capítulo sem tópicos e livro sem capítulos", () => {
    expect(validateCatalogBook(book({ chapters: [] })).ok).toBe(false);
    expect(validateCatalogBook(book({ chapters: [{ title: "X", topics: [] }] })).ok).toBe(false);
  });

  it("junta vários erros de uma vez", () => {
    const r = validateCatalogBook({ ...book(), title: "", year: 3000, verified: "não" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe("contagem de páginas", () => {
  it("conta as duas pontas do intervalo", () => {
    expect(topicPageCount({ page_start: 10, page_end: 10 })).toBe(1);
    expect(topicPageCount({ page_start: 10, page_end: 19 })).toBe(10);
    expect(bookPageCount(book())).toBe(40);
  });
});

describe("seed real (supabase/seed/catalog)", () => {
  const { books, errors } = loadCatalog();

  it("todos os JSONs são válidos", () => {
    expect(errors).toEqual([]);
  });

  it("tem ao menos 8 livros, cada um com verified booleano", () => {
    expect(books.length).toBeGreaterThanOrEqual(8);
    for (const b of books) expect(typeof b.verified).toBe("boolean");
  });

  it("slugs únicos", () => {
    const slugs = books.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
