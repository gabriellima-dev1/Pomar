import { describe, expect, it } from "vitest";
import { renderReview } from "./review.ts";
import type { CatalogBook } from "./schema.ts";

const book: CatalogBook = {
  slug: "teste",
  title: "Livro | Teste",
  authors: ["A", "B"],
  edition: "2ª ed.",
  publisher: "Editora",
  year: 2021,
  isbn: null,
  total_pages: 50,
  verified: false,
  source_note: "estimado",
  chapters: [
    {
      title: "1. Introdução",
      topics: [
        { title: "1.1 Começo", page_start: 1, page_end: 4 },
        { title: "1.2 Meio", page_start: 5, page_end: 9 },
      ],
    },
  ],
};

describe("renderReview", () => {
  const md = renderReview([book], [{ title: "Pendente X", reason: "sem sumário" }]);

  it("lista o livro com edição, origem e caixas de conferência", () => {
    expect(md).toContain("2ª ed., Editora, 2021");
    expect(md).toContain("**Origem do sumário:** estimado");
    expect(md).toContain("- [ ] Livro conferido");
    expect(md).toContain("### 1. Introdução (pp. 1–9)");
  });

  it("gera uma linha por tópico com a contagem de páginas", () => {
    expect(md).toContain("| 1.1 Começo | 1 | 4 | 4 |  |");
    expect(md).toContain("| 1.2 Meio | 5 | 9 | 5 |  |");
  });

  it("escapa barras verticais nas tabelas", () => {
    expect(md).toContain("Livro \\| Teste");
  });

  it("mostra os livros pendentes", () => {
    expect(md).toContain("**Pendente X** — sem sumário");
  });

  it("marca como conferido quando verified = true", () => {
    const done = renderReview([{ ...book, verified: true }]);
    expect(done).toContain("- [x] Livro conferido");
    expect(done).toContain("| conferido |");
  });
});
