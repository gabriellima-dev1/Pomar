import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar } from "@/components/subjects/ProgressBar";
import { requireUser } from "@/lib/auth/session";
import { effectivePace, formatDuration, remainingMinutes, subjectProgress } from "@/lib/estimates";
import { colorHex } from "@/lib/subjects/colors";
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
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Disciplinas</h1>
        <Link
          href="/disciplinas/nova"
          className="bg-primary text-primary-foreground inline-flex min-h-11 items-center rounded-lg px-4 font-semibold"
        >
          Nova disciplina
        </Link>
      </div>

      {query.calibrado && (
        <p role="status" className="border-border bg-surface rounded-lg border px-3 py-2 text-sm">
          Ritmo padrão salvo! As estimativas já usam o novo valor.
        </p>
      )}

      {subjects.length === 0 ? (
        <div className="border-border bg-surface flex flex-col items-start gap-3 rounded-xl border p-6">
          <p className="text-lg font-semibold">Seu pomar ainda está vazio 🌱</p>
          <p className="text-muted max-w-prose">
            Escolha um livro do catálogo ou monte sua própria lista de capítulos. O Seu Tomás
            calcula quanto tempo falta para você terminar.
          </p>
          <Link
            href="/disciplinas/nova"
            className="bg-primary text-primary-foreground inline-flex min-h-11 items-center rounded-lg px-4 font-semibold"
          >
            Criar minha primeira disciplina
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {subjects.map((s) => {
            const unit = s.source === "youtube" ? "minutos" : "paginas";
            const progress = subjectProgress(s.topics, unit);
            const pace = effectivePace(s.min_per_page, prefs.globalPace);
            const left = remainingMinutes(s.topics, pace.minPerPage, s.video_speed);
            return (
              <li key={s.id}>
                <Link
                  href={`/disciplinas/${s.id}`}
                  className="border-border bg-surface hover:border-foreground/40 flex h-full flex-col gap-3 rounded-xl border p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: colorHex(s.color) }}
                    />
                    <span className="flex-1 font-semibold">{s.title}</span>
                    <span className="text-sm font-semibold">{progress.percent}%</span>
                  </div>
                  <ProgressBar
                    percent={progress.percent}
                    color={s.color}
                    label={`Progresso de ${s.title}`}
                  />
                  <p className="text-muted text-sm">
                    {progress.remaining} {unit === "paginas" ? "páginas" : "minutos"} restantes ·
                    cerca de {formatDuration(left)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
