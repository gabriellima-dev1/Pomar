"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { cardClasses } from "@/components/ui/Card";
import { suggestColor } from "@/lib/subjects/colors";
import { shortAuthors } from "@/lib/subjects/summary";
import { ApproxBadge, BookCover } from "./CatalogPicker";

export type CatalogBookItem = {
  id: string;
  slug: string;
  title: string;
  authors: string;
  edition: string;
  verified: boolean;
  chapterCount: number;
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Busca por livro ou autor; escolher um livro abre o card com os capítulos (`?livro=`). */
export function CatalogSearch({
  books,
  selectedSlug,
}: {
  books: CatalogBookItem[];
  selectedSlug: string | null;
}) {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const matches = books.filter(
    (b) => b.slug !== selectedSlug && (!q || normalize(`${b.title} ${b.authors}`).includes(q)),
  );
  const showList = !selectedSlug || q.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label className="border-control-border bg-surface-200 focus-within:outline-focus-ring flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 focus-within:outline-3 focus-within:outline-offset-2">
        <Search size={22} aria-hidden className="text-ink-muted shrink-0" />
        <span className="sr-only">Buscar livro ou autor</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar livro ou autor"
          className="placeholder:text-ink-muted min-w-0 flex-1 bg-transparent text-base outline-none"
        />
      </label>

      {showList && (
        <ul className="flex flex-col gap-3" aria-label="Livros do catálogo">
          {matches.length === 0 && (
            <li className="text-small text-ink-muted px-1">
              Nenhum livro encontrado. Você pode montar a disciplina na aba Manual.
            </li>
          )}
          {matches.map((b, i) => (
            <li key={b.id}>
              <Link
                href={`/disciplinas/nova?livro=${b.slug}`}
                scroll={false}
                className={`${cardClasses} hover:border-control-border flex items-center gap-3 p-4`}
              >
                <BookCover authors={b.authors} color={suggestColor(i)} />
                <span className="flex min-w-0 flex-col">
                  <span className="font-extrabold">{b.title}</span>
                  <span className="text-small text-ink-muted flex flex-wrap items-center gap-x-2">
                    {shortAuthors(b.authors, true)} · {b.edition} · {b.chapterCount} capítulos
                    {!b.verified && <ApproxBadge />}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
