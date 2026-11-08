/**
 * Gera docs/catalogo-revisao.md a partir dos livros do seed.
 * Sem imports com alias: usado por scripts/catalog-review.ts (Node puro).
 */
import { bookPageCount, chapterPageCount, topicPageCount, type CatalogBook } from "./schema.ts";

export type PendingBook = { title: string; reason: string };

function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function pageRange(start: number, end: number): string {
  return start === end ? `p. ${start}` : `pp. ${start}–${end}`;
}

export function renderReview(books: CatalogBook[], pending: PendingBook[] = []): string {
  const out: string[] = [];
  const totalTopics = books.reduce(
    (sum, b) => sum + b.chapters.reduce((s, c) => s + c.topics.length, 0),
    0,
  );

  out.push("# Catálogo — revisão das páginas");
  out.push("");
  out.push(
    "> Gerado por `npm run catalog:review` a partir de `supabase/seed/catalog/*.json`. " +
      "Não precisa commitar as marcações: confiram, anotem as correções aqui (ou numa cópia) e " +
      "me avisem. Eu passo tudo para o JSON, troco o livro para `verified: true`, regenero este " +
      "arquivo e rodo o seed de novo.",
  );
  out.push("");
  out.push("## Como conferir");
  out.push("");
  out.push("1. Peguem a **mesma edição** indicada no livro (edição, editora e ano).");
  out.push(
    "2. Abram o sumário e confiram, capítulo por capítulo, o **título** e a **página inicial** de cada tópico.",
  );
  out.push(
    "3. Na coluna **Correção**, escrevam `ok` ou a página certa (ex.: `início 37`). Se o título " +
      "for diferente na tradução, escrevam o título certo.",
  );
  out.push("4. Marquem `[x]` no capítulo quando terminar e, no fim, em **Livro conferido**.");
  out.push("");
  out.push(
    "**Convenção:** a página final de um tópico é a página anterior ao início do próximo. A " +
      "introdução do capítulo entra no 1º tópico, e os exercícios do fim entram no último. Por isso " +
      "basta conferir a **página inicial** de cada tópico e a **final** do último tópico de cada capítulo.",
  );
  out.push("");
  out.push(
    "Enquanto um livro não for conferido, o app mostra o aviso **“páginas aproximadas”** " +
      "(`verified = false`).",
  );
  out.push("");

  out.push("## Resumo");
  out.push("");
  out.push(`${books.length} livros, ${totalTopics} tópicos.`);
  out.push("");
  out.push("| Livro | Edição | Capítulos | Tópicos | Páginas somadas | Status |");
  out.push("|---|---|---|---|---|---|");
  for (const b of books) {
    const topics = b.chapters.reduce((s, c) => s + c.topics.length, 0);
    out.push(
      `| ${cell(b.title)} | ${cell(`${b.edition}, ${b.publisher}, ${b.year}`)} | ${b.chapters.length} | ${topics} | ${bookPageCount(b)} | ${b.verified ? "conferido" : "a conferir"} |`,
    );
  }
  out.push("");

  if (pending.length > 0) {
    out.push("## Fora do seed por enquanto");
    out.push("");
    for (const p of pending) out.push(`- **${p.title}** — ${p.reason}`);
    out.push("");
  }

  for (const b of books) {
    out.push("---");
    out.push("");
    out.push(`## ${b.title}`);
    out.push("");
    out.push(`- **Autores:** ${b.authors.join(", ")}`);
    out.push(`- **Edição:** ${b.edition}, ${b.publisher}, ${b.year}`);
    out.push(`- **ISBN:** ${b.isbn ?? "a confirmar"}`);
    out.push(`- **Total de páginas:** ${b.total_pages ?? "a confirmar"}`);
    out.push(`- **Arquivo:** \`supabase/seed/catalog/${b.slug}.json\``);
    out.push(`- **Origem do sumário:** ${b.source_note}`);
    out.push("");
    out.push(`- [${b.verified ? "x" : " "}] Edição e total de páginas conferem`);
    out.push(`- [${b.verified ? "x" : " "}] Livro conferido`);
    out.push("");

    for (const c of b.chapters) {
      const first = c.topics[0];
      const last = c.topics[c.topics.length - 1];
      const range = first && last ? ` (${pageRange(first.page_start, last.page_end)})` : "";
      out.push(`### ${c.title}${range}`);
      out.push("");
      out.push(`- [${b.verified ? "x" : " "}] Capítulo conferido · ${chapterPageCount(c)} páginas`);
      out.push("");
      out.push("| Tópico | Início | Fim | Págs. | Correção |");
      out.push("|---|---|---|---|---|");
      for (const t of c.topics) {
        out.push(
          `| ${cell(t.title)} | ${t.page_start} | ${t.page_end} | ${topicPageCount(t)} |  |`,
        );
      }
      out.push("");
    }
  }

  return out.join("\n").trimEnd() + "\n";
}
