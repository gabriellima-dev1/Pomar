import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { pomodoroHref } from "@/components/subjects/SubjectCard";
import { effectivePace, subjectProgress, topicDetail } from "@/lib/estimates";
import { subjectColorVar } from "@/lib/subjects/colors";
import type { SubjectListItem } from "@/lib/subjects/queries";
import { nextTopic, shortAuthors, shortDate, subjectAcronym } from "@/lib/subjects/summary";

/**
 * "Continuar estudando" do Início (telas.md › Início como painel, 36 e 36b): a
 * disciplina estudada por último, com o selo da sigla (39d), o próximo tópico,
 * "Começar" (abre o Foco nesse tópico) e "Trocar disciplina" (abre Disciplinas).
 * Texto em `--on-primary` sobre `--primary` e `--primary-strong` (AA nos 4 temas).
 */
export function ContinueCard({
  subject,
  globalPace,
  focusMin,
}: {
  subject: SubjectListItem;
  globalPace: number | null;
  focusMin: number;
}) {
  const unit = subject.source === "youtube" ? "minutos" : "paginas";
  const progress = subjectProgress(subject.topics, unit);
  const next = nextTopic(subject.chapters);
  const pace = effectivePace(subject.min_per_page, globalPace);
  const detail = next
    ? topicDetail(next, {
        minPerPage: unit === "paginas" ? pace.minPerPage : null,
        videoSpeed: subject.video_speed,
        focusMin,
      })
    : null;
  const meta = [
    subject.catalog_book && shortAuthors(subject.catalog_book.authors),
    `${progress.percent}%`,
    subject.goal_date && `prova em ${shortDate(subject.goal_date)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      aria-labelledby="continuar-estudando"
      className="bg-primary text-on-primary shadow-card flex flex-col gap-4 rounded-[28px] p-5 lg:p-6"
    >
      <h2 id="continuar-estudando" className="text-caption">
        Continuar estudando
      </h2>
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-[14px] text-lg font-extrabold text-[var(--on-subject)]"
          style={{ background: subjectColorVar(subject.color) }}
        >
          {subjectAcronym(subject.title)}
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="font-display text-[26px] leading-8 font-semibold">{subject.title}</p>
          <p className="text-small font-semibold">{meta}</p>
        </div>
      </div>

      <div className="bg-primary-strong flex flex-col gap-0.5 rounded-[18px] px-4 py-3">
        {next ? (
          <>
            <span className="text-caption">Próximo tópico</span>
            <span className="text-heading">{next.title}</span>
            {detail && <span className="text-small">{detail}</span>}
          </>
        ) : (
          <span className="text-heading">Todos os tópicos concluídos. Que colheita!</span>
        )}
      </div>

      <div className="flex items-center gap-4 lg:gap-5">
        <Link
          href={pomodoroHref(subject.id, next?.id)}
          aria-label={next ? `Começar ${subject.title}: ${next.title}` : `Começar ${subject.title}`}
          className="bg-surface-200 text-primary-strong inline-flex min-h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-lg font-extrabold shadow-[0_4px_0_var(--primary-strong)] active:translate-y-1 active:shadow-none motion-reduce:transition-none lg:flex-none lg:px-6"
        >
          <Play size={20} aria-hidden fill="currentColor" strokeWidth={0} />
          Começar
        </Link>
        <Link
          href="/disciplinas"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 font-extrabold underline-offset-4 hover:underline"
        >
          Trocar disciplina
          <ArrowRight size={20} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
