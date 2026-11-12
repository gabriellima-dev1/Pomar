import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Play, Timer } from "lucide-react";
import { ApproxPagesNotice } from "@/components/subjects/ApproxPagesNotice";
import { pomodoroHref } from "@/components/subjects/SubjectCard";
import { TopicItem } from "@/components/subjects/TopicItem";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { ProgressRing } from "@/components/ui/Progress";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { TopBar, iconButtonClasses } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth/session";
import { localDay } from "@/lib/dates";
import {
  effectivePace,
  formatPace,
  goalComparison,
  pomodorosFor,
  remainingMinutes,
  subjectProgress,
  topicMinutes,
  topicPages,
} from "@/lib/estimates";
import { forecastDay } from "@/lib/subjects/history";
import { subjectColorVar } from "@/lib/subjects/colors";
import {
  getHomeProfile,
  getPreferences,
  getStudyHistory,
  getSubject,
} from "@/lib/subjects/queries";
import { nextTopic, shortAuthors, shortDate } from "@/lib/subjects/summary";
import { isUuid } from "@/lib/subjects/validation";

export const metadata: Metadata = { title: "Disciplina" };

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 px-3 py-3">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="text-body-strong">{value}</dd>
    </Card>
  );
}

function pageRange(start: number | null, end: number | null): string {
  if (start == null || end == null) return "";
  return start === end ? `p. ${start}` : `p. ${start}–${end}`;
}

/** "4.1 O problema…" → "4.1" (rodapé); sem número, o título inteiro. */
function topicLabel(title: string): string {
  const match = /^(\d+(?:\.\d+)*)\s/.exec(title);
  return match?.[1] ?? title;
}

export default async function DisciplinaPage({
  params,
  searchParams,
}: PageProps<"/disciplinas/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [subject, prefs, profile, query] = await Promise.all([
    getSubject(id),
    getPreferences(user.id),
    getHomeProfile(user.id),
    searchParams,
  ]);
  if (!subject) notFound();
  const history = await getStudyHistory(profile.timezone);
  const today = localDay(new Date(), profile.timezone);

  const topics = subject.chapters.flatMap((c) => c.topics);
  const unit = subject.source === "youtube" ? "minutos" : "paginas";
  const progress = subjectProgress(topics, unit);
  const pace = effectivePace(subject.min_per_page, prefs.globalPace);
  const next = nextTopic(subject.chapters);
  const finishDay = forecastDay(
    remainingMinutes(topics, pace.minPerPage, subject.video_speed),
    history.get(subject.id),
    today,
  );
  const approx = subject.catalog_book && !subject.catalog_book.verified;
  const book = subject.catalog_book
    ? `${shortAuthors(subject.catalog_book.authors, true)} · ${subject.catalog_book.edition}`
    : null;

  const nextMinutes = next ? topicMinutes(next, pace.minPerPage, subject.video_speed) : 0;
  const nextPomodoros = Math.max(1, pomodorosFor(nextMinutes, prefs.focusMin));
  const nextPages = next ? topicPages(next) : 0;
  const footerSummary = next
    ? [
        topicLabel(next.title),
        nextPages > 0 && `${nextPages} ${nextPages === 1 ? "página" : "páginas"}`,
        `cerca de ${nextPomodoros} ${nextPomodoros === 1 ? "pomodoro" : "pomodoros"}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <section className="flex flex-col gap-5">
      <TopBar backHref="/inicio" backLabel="Voltar para o início">
        {unit === "paginas" && (
          <Link
            href={`/disciplinas/${subject.id}/calibrar`}
            className={iconButtonClasses}
            aria-label="Calibrar ritmo"
          >
            <Timer size={24} aria-hidden />
          </Link>
        )}
        <Link
          href={`/disciplinas/${subject.id}/editar`}
          className={iconButtonClasses}
          aria-label="Editar disciplina"
        >
          <Pencil size={22} aria-hidden />
        </Link>
      </TopBar>

      <header className="flex items-center gap-4">
        <ProgressRing
          percent={progress.percent}
          color={subjectColorVar(subject.color)}
          size={88}
          stroke={10}
          label={`Progresso de ${subject.title}`}
        >
          <span className="font-display text-xl font-semibold">{progress.percent}%</span>
        </ProgressRing>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="font-display text-[26px] leading-8 font-semibold">{subject.title}</h1>
          {book && <p className="text-ink-muted font-semibold">{book}</p>}
        </div>
      </header>

      {/* Computador: capítulos à esquerda e mini-cards numa coluna de 320px à direita. */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-10 lg:col-start-2 lg:row-start-1">
          {query.calibrado && (
            <Notice>Ritmo calibrado! As estimativas já usam o novo valor.</Notice>
          )}

          <dl className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            <MiniStat
              label={unit === "paginas" ? "Páginas" : "Minutos"}
              value={`${progress.done} / ${progress.total}`}
            />
            <MiniStat
              label="Seu ritmo"
              value={
                unit === "paginas"
                  ? `${formatPace(pace.minPerPage).replace(" min", "")} min/pág`
                  : `${subject.video_speed.toLocaleString("pt-BR")}×`
              }
            />
            <MiniStat label="Término" value={finishDay ? `~${shortDate(finishDay)}` : "—"} />
          </dl>

          {unit === "paginas" && pace.source === "padrao" && (
            <p className="text-small text-ink-muted">
              Estimativa padrão de 3 min por página.{" "}
              <Link
                href={`/disciplinas/${subject.id}/calibrar`}
                className="text-primary font-extrabold underline underline-offset-4"
              >
                Calibre seu ritmo
              </Link>{" "}
              para eu acertar as contas.
            </p>
          )}
          {subject.goal_date && (
            <p className="text-small text-ink-muted">
              Prova em {shortDate(subject.goal_date)}
              {finishDay
                ? ` · no seu ritmo atual, ${goalComparison(finishDay, subject.goal_date)}.`
                : ". A previsão de término aparece depois dos seus primeiros pomodoros."}
            </p>
          )}
          {approx && <ApproxPagesNotice />}
        </aside>

        <ol className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1">
          {subject.chapters.map((chapter) => {
            const done = chapter.topics.filter((t) => t.done_at).length;
            const complete = chapter.topics.length > 0 && done === chapter.topics.length;
            return (
              <li key={chapter.id}>
                <Card className="flex flex-col gap-2 px-3 pt-4 pb-3">
                  <h2 className="flex items-center justify-between gap-2 px-1">
                    <span className="text-heading">{chapter.title}</span>
                    {complete ? (
                      <span className="bg-primary-soft text-primary-strong text-small shrink-0 rounded-full px-3 py-0.5 font-extrabold">
                        Concluído
                      </span>
                    ) : (
                      <span className="text-small text-ink-muted shrink-0">
                        {done} de {chapter.topics.length}
                      </span>
                    )}
                  </h2>
                  {chapter.topics.length === 0 ? (
                    <p className="text-small text-ink-muted px-1">Nenhum tópico neste capítulo.</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {chapter.topics.map((t) => (
                        <li key={t.id}>
                          <TopicItem
                            subjectId={subject.id}
                            topicId={t.id}
                            title={t.title}
                            done={Boolean(t.done_at)}
                            isNext={next?.id === t.id}
                            detail={pageRange(t.page_start, t.page_end)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            );
          })}
        </ol>
      </div>

      {next && (
        <StickyFooter summary={footerSummary}>
          <Link href={pomodoroHref(subject.id, next.id)} className={buttonClasses("primary", "lg")}>
            <Play size={20} aria-hidden fill="currentColor" strokeWidth={0} />
            Começar pomodoro
          </Link>
        </StickyFooter>
      )}
    </section>
  );
}
