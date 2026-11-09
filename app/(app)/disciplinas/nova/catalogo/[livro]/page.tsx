import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApproxPagesNotice } from "@/components/subjects/ApproxPagesNotice";
import { BackLink } from "@/components/subjects/BackLink";
import { CatalogPicker } from "@/components/subjects/CatalogPicker";
import { requireUser } from "@/lib/auth/session";
import { effectivePace, paceLabel } from "@/lib/estimates";
import { suggestColor } from "@/lib/subjects/colors";
import { countSubjects, getCatalogBook, getPreferences } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Escolher capítulos" };

export default async function LivroPage({
  params,
}: PageProps<"/disciplinas/nova/catalogo/[livro]">) {
  const user = await requireUser();
  const { livro } = await params;
  const [book, prefs, count] = await Promise.all([
    getCatalogBook(livro),
    getPreferences(user.id),
    countSubjects(),
  ]);
  if (!book) notFound();

  const pace = effectivePace(null, prefs.globalPace);

  return (
    <section className="flex flex-col gap-6">
      <BackLink href="/disciplinas/nova/catalogo">Catálogo</BackLink>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="text-muted">{book.authors}</p>
        <p className="text-muted text-sm">
          {book.edition}, {book.publisher}, {book.year}
        </p>
      </div>
      {!book.verified && <ApproxPagesNotice />}
      <p className="text-muted text-sm">Estimativas com {paceLabel(pace)}.</p>

      <CatalogPicker
        book={{ id: book.id, title: book.title }}
        chapters={book.chapters}
        minPerPage={pace.minPerPage}
        focusMin={prefs.focusMin}
        defaultColor={suggestColor(count)}
      />
    </section>
  );
}
