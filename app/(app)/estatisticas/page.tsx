import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HourBars, PredictedBars, SubjectsBreakdown, YearHeatmap } from "@/components/stats/Blocks";
import { FocusBarsChart, PaceLineChart } from "@/components/stats/Charts";
import { cardClasses } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { requireUser } from "@/lib/auth/session";
import { addDays, localDay } from "@/lib/dates";
import { effectivePace, formatPace } from "@/lib/estimates";
import { shortDate } from "@/lib/gamification/present";
import { getGameProfile } from "@/lib/gamification/queries";
import { getCompletedSessions, getDoneTopics, getStatSubjects } from "@/lib/stats/queries";
import {
  bestHours,
  bySubject,
  comparisonText,
  focusBars,
  focusSummary,
  formatHM,
  isPeriodKind,
  paceSeries,
  paceTrend,
  periodFor,
  periodLabel,
  predictedVsActual,
  roundedPcts,
  shiftPeriod,
  yearHeatmap,
  type Period,
} from "@/lib/stats/stats";
import { getPreferences } from "@/lib/subjects/queries";
import { subjectColorVar } from "@/lib/subjects/colors";

export const metadata: Metadata = { title: "Estatísticas" };

const card = `${cardClasses} flex flex-col gap-4 p-5`;
const KIND_LABEL = { semana: "Semana", mes: "Mês", ano: "Ano" } as const;

function href(p: Period, subject?: string | null): string {
  const q = new URLSearchParams({ p: p.kind, d: p.start });
  if (subject) q.set("disciplina", subject);
  return `/estatisticas?${q}`;
}

function MiniCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface-100 flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-3 text-center">
      <span className="font-display text-[26px] leading-8 font-semibold tabular-nums">{value}</span>
      <span className="text-small text-ink-muted font-extrabold">{label}</span>
    </div>
  );
}

/**
 * Estatísticas pessoais (referencias/29-estatisticas.png, DESIGN §4.6): Semana · Mês ·
 * Ano, tempo de foco, dias estudados no ano, por disciplina, ritmo, melhor horário e
 * previsto × real. Tudo no fuso do usuário e só com ciclos concluídos; iguais para as
 * duas coortes (não são recompensa).
 */
export default async function EstatisticasPage({ searchParams }: PageProps<"/estatisticas">) {
  const user = await requireUser();
  const q = await searchParams;
  const game = await getGameProfile(user.id);
  const tz = game.timezone;
  const today = localDay(new Date(), tz);

  const kind = isPeriodKind(q.p) ? q.p : "semana";
  const day =
    typeof q.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(q.d) && q.d <= today ? q.d : today;
  const period = periodFor(kind, day);
  const previous = shiftPeriod(period, -1);
  const next = shiftPeriod(period, 1);
  const year = Number(period.start.slice(0, 4));
  const from = [previous.start, `${year}-01-01`, addDays(today, -29)].sort()[0]!;

  const [sessions, subjects, topics, prefs] = await Promise.all([
    getCompletedSessions(from, tz),
    getStatSubjects(),
    getDoneTopics(period.start, tz),
    getPreferences(user.id),
  ]);
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const summary = focusSummary(sessions, period, tz);
  const bars = focusBars(sessions, period, tz, today);
  const heat = yearHeatmap(sessions, year, tz, today);
  const best = bestHours(sessions, tz, today);
  const shares = bySubject(sessions, period, tz);
  const pcts = roundedPcts(shares.map((s) => s.pct));

  // Ritmo: disciplina escolhida, ou a mais estudada no período que tem páginas registradas.
  const paceOptions = shares
    .filter((s) => s.id && paceSeries(sessions, period, tz, s.id).length > 0)
    .map((s) => subjectById.get(s.id as string))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const paceSubject = paceOptions.find((s) => s.id === q.disciplina) ?? paceOptions[0] ?? null;
  const points = paceSubject ? paceSeries(sessions, period, tz, paceSubject.id) : [];
  const trend = paceTrend(points);
  const pv = predictedVsActual(
    topics,
    sessions,
    new Map(subjects.map((s) => [s.id, { minPerPage: s.minPerPage, videoSpeed: s.videoSpeed }])),
    prefs.globalPace,
    period,
    tz,
  );
  const empty = summary.pomodoros === 0;

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-display pt-2">Estatísticas</h1>
      <SegmentedNav
        label="Período"
        items={(["semana", "mes", "ano"] as const).map((k) => ({
          label: KIND_LABEL[k],
          href: href(periodFor(k, day)),
          active: k === kind,
        }))}
      />

      <nav aria-label="Navegar entre períodos" className="flex items-center justify-between gap-2">
        <Link
          href={href(previous, paceSubject?.id)}
          aria-label="Período anterior"
          className="text-ink hover:bg-surface-300 inline-grid size-11 place-items-center rounded-full"
        >
          <ChevronLeft size={28} aria-hidden />
        </Link>
        <p className="text-heading text-center" aria-live="polite">
          {periodLabel(period)}
        </p>
        {next.start <= today ? (
          <Link
            href={href(next, paceSubject?.id)}
            aria-label="Próximo período"
            className="text-ink hover:bg-surface-300 inline-grid size-11 place-items-center rounded-full"
          >
            <ChevronRight size={28} aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="text-ink-muted inline-grid size-11 place-items-center opacity-30"
          >
            <ChevronRight size={28} />
          </span>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {empty ? (
          <div className="lg:col-span-2">
            <EmptyState title="Ainda não há pomodoros neste período">
              Quando você concluir um ciclo, eu mostro aqui quanto tempo estudou e como seu ritmo
              está mudando.
            </EmptyState>
          </div>
        ) : (
          <section aria-labelledby="foco" className={`${card} lg:col-span-2`}>
            <h2 id="foco" className="text-caption text-ink-muted">
              Tempo de foco
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-[40px] leading-[48px] font-semibold">
                {formatHM(summary.totalMin)}
              </p>
              <span className="bg-primary-soft text-primary-strong text-small rounded-full px-3 py-1 font-extrabold">
                {comparisonText(kind, summary.totalMin, summary.previousMin)}
              </span>
            </div>
            <FocusBarsChart
              bars={bars}
              label={`Minutos de foco: ${bars.map((b) => `${b.title}, ${b.minutes} min`).join("; ")}`}
            />
            <div className="flex gap-3">
              <MiniCard value={String(summary.pomodoros)} label="pomodoros" />
              <MiniCard value={`${summary.noPausePct ?? 0}%`} label="sem pausa" />
              <MiniCard value={String(summary.studyDays)} label="dias com estudo" />
            </div>
          </section>
        )}

        <section aria-labelledby="ano" className={`${card} lg:col-span-2`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="ano" className="text-caption text-ink-muted">
              Dias estudados em {year}
            </h2>
            <span className="text-ink-muted font-extrabold">
              {heat.studiedDays === 1 ? "1 dia" : `${heat.studiedDays} dias`}
            </span>
          </div>
          <YearHeatmap
            weeks={heat.weeks}
            label={`Dias estudados em ${year}: ${heat.studiedDays}. Tons: sem estudo, menos de 30 min, 30 a 60 min, mais de 60 min.`}
          />
        </section>

        {!empty && shares.length > 0 && (
          <section aria-labelledby="disciplinas" className={card}>
            <h2 id="disciplinas" className="text-caption text-ink-muted">
              Por disciplina
            </h2>
            <SubjectsBreakdown
              rows={shares.map((s, i) => {
                const subj = s.id ? subjectById.get(s.id) : null;
                return {
                  key: s.id ?? "livre",
                  title: subj?.title ?? (s.id ? "Disciplina removida" : "Sessões livres"),
                  color: subj?.color ?? null,
                  minutes: s.minutes,
                  pct: pcts[i] ?? 0,
                };
              })}
            />
          </section>
        )}

        {!empty && paceSubject && points.length > 0 && (
          <section aria-labelledby="ritmo" className={card}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="ritmo" className="text-caption text-ink-muted">
                Seu ritmo · {paceSubject.title}
              </h2>
              <span className="text-primary-strong shrink-0 font-extrabold">
                {formatPace(effectivePace(paceSubject.minPerPage, prefs.globalPace).minPerPage)}
                /pág.
              </span>
            </div>
            {paceOptions.length > 1 && (
              <ul className="flex flex-wrap gap-2" aria-label="Escolher disciplina">
                {paceOptions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={href(period, s.id)}
                      aria-current={s.id === paceSubject.id ? "true" : undefined}
                      className={`text-small inline-flex min-h-11 items-center rounded-full px-4 font-extrabold ${
                        s.id === paceSubject.id
                          ? "bg-primary-soft text-primary-strong"
                          : "bg-surface-100 text-ink-muted"
                      }`}
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {points.length > 1 && (
              <PaceLineChart
                points={points.map((p, i) => ({
                  i,
                  label: shortDate(localDay(new Date(p.at), tz)),
                  value: p.minPerPage,
                }))}
                color={subjectColorVar(paceSubject.color)}
                label={`Minutos por página em cada ciclo: ${points.map((p) => p.minPerPage.toLocaleString("pt-BR")).join(", ")}`}
              />
            )}
            <p className="text-ink-muted">
              {!trend ? (
                "Registre as páginas em mais ciclos para ver como seu ritmo muda."
              ) : trend.pct < 3 ? (
                "Seu ritmo está estável neste período."
              ) : (
                <>
                  Você está lendo cerca de{" "}
                  <strong className="text-ink font-extrabold">
                    {trend.pct}% mais {trend.faster ? "rápido" : "devagar"}
                  </strong>{" "}
                  do que no começo do período.
                </>
              )}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
          <section aria-labelledby="horario" className={card}>
            <h2 id="horario" className="text-caption text-ink-muted">
              Melhor horário
            </h2>
            {best.start === null ? (
              <p className="text-ink-muted">Sem pomodoros nos últimos 30 dias.</p>
            ) : (
              <>
                <p className="font-display text-[30px] leading-9 font-semibold">
                  {best.start}h–{best.start + 2}h
                </p>
                <HourBars hours={best.hours} start={best.start} />
                <p className="text-small text-ink-muted font-semibold">
                  {best.sharePct}% do seu foco nos últimos 30 dias foi nesse horário.
                </p>
              </>
            )}
          </section>

          <section aria-labelledby="previsto" className={card}>
            <h2 id="previsto" className="text-caption text-ink-muted">
              Previsto × real
            </h2>
            {pv ? (
              <>
                <p className="font-display text-[30px] leading-9 font-semibold">±{pv.errorPct}%</p>
                <PredictedBars predicted={pv.predictedAvg} actual={pv.actualAvg} />
                <p className="text-small text-ink-muted font-semibold">
                  Erro médio das estimativas por tópico ({pv.count}{" "}
                  {pv.count === 1 ? "tópico concluído" : "tópicos concluídos"}).
                </p>
              </>
            ) : (
              <p className="text-ink-muted">
                Conclua um tópico estudado com pomodoros para comparar o previsto com o real.
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
