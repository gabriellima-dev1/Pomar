import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproxPagesNotice } from "@/components/subjects/ApproxPagesNotice";
import { BackLink } from "@/components/subjects/BackLink";
import { ProgressBar } from "@/components/subjects/ProgressBar";
import { TopicCheckbox } from "@/components/subjects/TopicCheckbox";
import { requireUser } from "@/lib/auth/session";
import {
  effectivePace,
  formatDuration,
  paceLabel,
  pomodorosFor,
  remainingMinutes,
  subjectProgress,
  topicMinutes,
  topicPages,
} from "@/lib/estimates";
import { colorHex } from "@/lib/subjects/colors";
import { getPreferences, getSubject } from "@/lib/subjects/queries";
import { isUuid } from "@/lib/subjects/validation";

export const metadata: Metadata = { title: "Disciplina" };

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-0.5 rounded-xl border p-3">
      <dt className="text-muted text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
      {hint && <dd className="text-muted text-xs">{hint}</dd>}
    </div>
  );
}

export default async function DisciplinaPage({
  params,
  searchParams,
}: PageProps<"/disciplinas/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [subject, prefs, query] = await Promise.all([
    getSubject(id),
    getPreferences(user.id),
    searchParams,
  ]);
  if (!subject) notFound();

  const topics = subject.chapters.flatMap((c) => c.topics);
  const unit = subject.source === "youtube" ? "minutos" : "paginas";
  const progress = subjectProgress(topics, unit);
  const pace = effectivePace(subject.min_per_page, prefs.globalPace);
  const leftMin = remainingMinutes(topics, pace.minPerPage, subject.video_speed);
  const approx = subject.catalog_book && !subject.catalog_book.verified;

  return (
    <section className="flex flex-col gap-6">
      <BackLink href="/disciplinas">Disciplinas</BackLink>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-4 shrink-0 rounded-full"
              style={{ backgroundColor: colorHex(subject.color) }}
            />
            <h1 className="text-3xl font-bold">{subject.title}</h1>
          </div>
          <Link
            href={`/disciplinas/${subject.id}/editar`}
            className="border-border inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold"
          >
            Editar
          </Link>
        </div>
        {(subject.catalog_book || subject.goal_date || subject.daily_goal) && (
          <p className="text-muted text-sm">
            {[
              subject.catalog_book &&
                `${subject.catalog_book.title} · ${subject.catalog_book.edition}`,
              subject.goal_date && `Prova/meta em ${formatDate(subject.goal_date)}`,
              subject.daily_goal &&
                `Meta: ${subject.daily_goal} ${subject.daily_goal === 1 ? "pomodoro" : "pomodoros"} por dia`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <ProgressBar
          percent={progress.percent}
          color={subject.color}
          label={`Progresso de ${subject.title}`}
        />
      </header>

      {query.calibrado && (
        <p role="status" className="border-border bg-surface rounded-lg border px-3 py-2 text-sm">
          Ritmo calibrado! 🍅 As estimativas abaixo já usam o novo valor.
        </p>
      )}
      {approx && <ApproxPagesNotice />}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Progresso"
          value={`${progress.percent}%`}
          hint={`${progress.topicsDone} de ${progress.topicsTotal} tópicos`}
        />
        <Stat
          label={unit === "paginas" ? "Páginas restantes" : "Minutos restantes"}
          value={String(progress.remaining)}
          hint={`de ${progress.total}`}
        />
        <Stat
          label="Tempo estimado"
          value={formatDuration(leftMin)}
          hint={`${pomodorosFor(leftMin, prefs.focusMin)} pomodoros de ${prefs.focusMin} min`}
        />
        <Stat
          label="Previsão de término"
          value="—"
          hint="Aparece depois dos seus primeiros pomodoros."
        />
      </dl>

      {unit === "paginas" && (
        <p className="text-muted text-sm">
          Ritmo: {paceLabel(pace)}.{" "}
          <Link
            href={`/disciplinas/${subject.id}/calibrar`}
            className="text-primary font-medium underline underline-offset-4"
          >
            {pace.source === "disciplina" ? "Calibrar de novo" : "Calibrar meu ritmo"}
          </Link>
        </p>
      )}

      <ol className="flex flex-col gap-4">
        {subject.chapters.map((chapter) => {
          const done = chapter.topics.filter((t) => t.done_at).length;
          return (
            <li key={chapter.id} className="border-border bg-surface rounded-xl border p-4">
              <h2 className="flex flex-wrap items-baseline justify-between gap-2 font-semibold">
                <span>{chapter.title}</span>
                <span className="text-muted text-sm font-normal">
                  {done}/{chapter.topics.length}
                </span>
              </h2>
              {chapter.topics.length === 0 ? (
                <p className="text-muted mt-2 text-sm">Nenhum tópico neste capítulo.</p>
              ) : (
                <ul className="mt-2 flex flex-col">
                  {chapter.topics.map((t) => {
                    const pages = topicPages(t);
                    const minutes = topicMinutes(t, pace.minPerPage, subject.video_speed);
                    const range =
                      t.page_start != null
                        ? t.page_start === t.page_end
                          ? `p. ${t.page_start}`
                          : `pp. ${t.page_start}–${t.page_end}`
                        : "";
                    const detail = [range, minutes > 0 ? `~${formatDuration(minutes)}` : ""]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={t.id}>
                        <TopicCheckbox
                          subjectId={subject.id}
                          topicId={t.id}
                          title={t.title}
                          done={Boolean(t.done_at)}
                          detail={detail || `${pages} p.`}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
