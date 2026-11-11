import Link from "next/link";
import { Play } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/Progress";
import { effectivePace, remainingMinutes, subjectProgress } from "@/lib/estimates";
import { subjectColorVar } from "@/lib/subjects/colors";
import { forecastDay, type SubjectHistory } from "@/lib/subjects/history";
import type { SubjectListItem } from "@/lib/subjects/queries";
import { compactDuration, nextTopic, shortAuthors, shortDate } from "@/lib/subjects/summary";

/** Endereço do pomodoro no próximo tópico (1 clique a partir do card). */
export function pomodoroHref(subjectId: string, topicId?: string | null): string {
  const params = new URLSearchParams({ disciplina: subjectId });
  if (topicId) params.set("topico", topicId);
  return `/pomodoro?${params.toString()}`;
}

/**
 * Card de disciplina: o card inteiro abre a disciplina; "Começar" vai direto ao pomodoro.
 * (docs/design/telas.md › SubjectCard, referencias/01-inicio.png)
 */
export function SubjectCard({
  subject,
  globalPace,
  history,
  today,
}: {
  subject: SubjectListItem;
  globalPace: number | null;
  /** Histórico de pomodoros desta disciplina (previsão de término). */
  history?: SubjectHistory;
  /** Dia local do usuário (AAAA-MM-DD). */
  today: string;
}) {
  const unit = subject.source === "youtube" ? "minutos" : "paginas";
  const progress = subjectProgress(subject.topics, unit);
  const pace = effectivePace(subject.min_per_page, globalPace);
  const leftMin = remainingMinutes(subject.topics, pace.minPerPage, subject.video_speed);
  const next = nextTopic(subject.chapters);
  const color = subjectColorVar(subject.color);

  const meta = [
    subject.catalog_book && shortAuthors(subject.catalog_book.authors),
    subject.catalog_book?.edition,
    subject.goal_date && `prova em ${shortDate(subject.goal_date)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const finish = forecastDay(leftMin, history, today);
  const remaining =
    progress.remaining > 0
      ? `Faltam ${progress.remaining} ${unit === "paginas" ? "pág." : "min"} · ${compactDuration(leftMin)}${
          finish ? ` · termina ~${shortDate(finish)}` : ""
        }`
      : progress.topicsTotal > 0 && progress.percent === 100
        ? "Tudo concluído!"
        : null;

  return (
    <article className={`${cardClasses} relative flex flex-col gap-4 p-4`}>
      <div className="flex items-center gap-4">
        <ProgressRing
          percent={progress.percent}
          color={color}
          size={56}
          label={`Progresso de ${subject.title}`}
        >
          <span className="text-small">{progress.percent}%</span>
        </ProgressRing>
        <div className="flex min-w-0 flex-col">
          <h3 className="text-heading">
            <Link
              href={`/disciplinas/${subject.id}`}
              className="after:absolute after:inset-0 after:rounded-lg after:content-['']"
            >
              {subject.title}
            </Link>
          </h3>
          {meta && <p className="text-small text-ink-muted">{meta}</p>}
        </div>
      </div>

      {next && (
        <p className="bg-surface-300 flex gap-3 rounded-md px-4 py-3">
          <span className="text-caption text-ink-muted shrink-0 pt-1">Próximo</span>
          <span className="font-semibold">{next.title}</span>
        </p>
      )}

      {(remaining || next) && (
        <div className="flex items-center justify-between gap-3">
          {remaining && <p className="text-small text-ink-muted">{remaining}</p>}
          {next && (
            <Link
              href={pomodoroHref(subject.id, next.id)}
              className={buttonClasses("primary", "md", "relative z-10 ml-auto")}
              aria-label={`Começar pomodoro de ${subject.title}: ${next.title}`}
            >
              <Play size={18} aria-hidden fill="currentColor" strokeWidth={0} />
              Começar
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
