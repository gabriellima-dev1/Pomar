import type { Metadata } from "next";
import Link from "next/link";
import { ApproxPagesNotice } from "@/components/subjects/ApproxPagesNotice";
import { BackLink } from "@/components/subjects/BackLink";
import { listCatalogBooks } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Catálogo" };

export default async function CatalogoPage() {
  const books = await listCatalogBooks();

  return (
    <section className="flex flex-col gap-6">
      <BackLink href="/disciplinas/nova">Nova disciplina</BackLink>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="text-muted max-w-prose">
          Livros do curso de Ciência da Computação. Só trazemos o sumário (capítulos, tópicos e
          páginas), nada do conteúdo.
        </p>
      </div>

      <ul className="grid gap-3">
        {books.map((b) => (
          <li key={b.id}>
            <Link
              href={`/disciplinas/nova/catalogo/${b.slug}`}
              className="border-border bg-surface hover:border-foreground/40 flex flex-col gap-1 rounded-xl border p-4"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{b.title}</span>
                {!b.verified && <ApproxPagesNotice compact />}
              </span>
              <span className="text-muted text-sm">{b.authors}</span>
              <span className="text-muted text-sm">
                {b.edition}, {b.publisher}, {b.year} · {b.chapterCount} capítulos
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
