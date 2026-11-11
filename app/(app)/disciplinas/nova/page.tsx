import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPicker } from "@/components/subjects/CatalogPicker";
import { CatalogSearch } from "@/components/subjects/CatalogSearch";
import { NewSubjectTabs } from "@/components/subjects/NewSubjectTabs";
import { requireUser } from "@/lib/auth/session";
import { suggestColor } from "@/lib/subjects/colors";
import {
  countSubjects,
  getCatalogBook,
  getPreferences,
  listCatalogBooks,
} from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Nova disciplina" };

/** Nova disciplina pelo catálogo (referencias/03-nova-disciplina-catalogo.png). */
export default async function NovaDisciplinaPage({ searchParams }: PageProps<"/disciplinas/nova">) {
  const user = await requireUser();
  const { livro } = await searchParams;
  const slug = typeof livro === "string" ? livro : null;
  const [books, book, prefs, count] = await Promise.all([
    listCatalogBooks(),
    slug ? getCatalogBook(slug) : Promise.resolve(null),
    getPreferences(user.id),
    countSubjects(),
  ]);
  if (slug && !book) notFound();

  return (
    <section className="flex flex-col gap-5">
      <NewSubjectTabs active="catalogo" />
      <CatalogSearch books={books} selectedSlug={book?.slug ?? null} />
      {book && (
        <CatalogPicker
          key={book.id}
          book={book}
          defaultColor={suggestColor(count)}
          globalPace={prefs.globalPace}
        />
      )}
      {!book && (
        <p className="text-small text-ink-muted">
          Só trazemos o sumário dos livros (capítulos, tópicos e páginas), nada do conteúdo.
        </p>
      )}
    </section>
  );
}
