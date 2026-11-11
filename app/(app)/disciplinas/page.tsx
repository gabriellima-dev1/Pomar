import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Timer } from "lucide-react";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { requireUser } from "@/lib/auth/session";
import { formatPace } from "@/lib/estimates";
import { getPreferences, listSubjects } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Disciplinas" };

export default async function DisciplinasPage({ searchParams }: PageProps<"/disciplinas">) {
  const user = await requireUser();
  const [subjects, prefs, query] = await Promise.all([
    listSubjects(),
    getPreferences(user.id),
    searchParams,
  ]);

  return (
    <section className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-display">Disciplinas</h1>
        {subjects.length > 0 && (
          <Link href="/disciplinas/nova" className={buttonClasses("secondary", "sm")}>
            <Plus size={18} aria-hidden />
            Nova
            <span className="sr-only"> disciplina</span>
          </Link>
        )}
      </div>

      {query.calibrado && <Notice>Ritmo padrão salvo! As estimativas já usam o novo valor.</Notice>}

      <Link
        href="/calibrar"
        className="bg-surface-300 flex min-h-14 items-center gap-3 rounded-lg px-4 py-3"
      >
        <Timer size={22} aria-hidden className="text-primary shrink-0" />
        <span className="flex flex-1 flex-col">
          <span className="font-extrabold">Meu ritmo de leitura</span>
          <span className="text-small text-ink-muted">
            {prefs.globalPace !== null
              ? `${formatPace(prefs.globalPace)} por página`
              : "Ainda não calibrado · usando 3 min por página"}
          </span>
        </span>
      </Link>

      {subjects.length === 0 ? (
        <EmptyState
          title="Seu pomar ainda está vazio"
          action={
            <Link href="/disciplinas/nova" className={buttonClasses("primary", "lg")}>
              Criar minha primeira disciplina
            </Link>
          }
        >
          Escolha um livro do catálogo ou monte sua lista de capítulos. Eu calculo quanto tempo
          falta.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-6">
          {subjects.map((s) => (
            <li key={s.id}>
              <SubjectCard subject={s} globalPace={prefs.globalPace} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
