import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { YesterdayFruitCard } from "@/components/gamification/YesterdayFruitCard";
import { ContinueCard } from "@/components/home/ContinueCard";
import { FirstFruitCard } from "@/components/home/FirstFruitCard";
import { LevelCard } from "@/components/home/LevelCard";
import { ProfileHighlight } from "@/components/home/ProfileHighlight";
import { WeekCard } from "@/components/home/WeekCard";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { StatChip } from "@/components/ui/StatChip";
import { getAccount, latestSubjectId } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { addDays } from "@/lib/dates";
import { focusSummary } from "@/lib/focus-summary";
import { getLeagueView } from "@/lib/league/queries";
import { whenLabel } from "@/lib/social/feed";
import { getFriendsFeed, getReceivedReactions } from "@/lib/social/queries";
import { masteryCounts, masteryMode } from "@/lib/gamification/mastery";
import { daysAway } from "@/lib/gamification/present";
import { getBadgeHistory, getGameProfile } from "@/lib/gamification/queries";
import { homeLine } from "@/lib/mascot/lines";
import { homeRedirect } from "@/lib/onboarding";
import { getCompletedSessions } from "@/lib/stats/queries";
import { bestHours, focusBars, focusSummary as periodSummary, periodFor } from "@/lib/stats/stats";
import {
  getHomeProfile,
  getPreferences,
  getRecentFocusSessions,
  getStudyHistory,
  listSubjects,
  sortByLastStudied,
} from "@/lib/subjects/queries";
import { greeting, localParts } from "@/lib/subjects/summary";

export const metadata: Metadata = { title: "Início" };

const STEPS = [
  { strong: "Escolha o que estudar", rest: " e marque os capítulos." },
  { strong: "Calibre seu ritmo", rest: " lendo uma página com o cronômetro." },
  { strong: "Colha um fruto", rest: " a cada pomodoro concluído." },
];

export default async function InicioPage() {
  const user = await requireUser();
  const account = await getAccount(user.id);
  // Onboarding: o Início só leva ao passo atual antes da 1ª disciplina e no "primeiro
  // fruto"; no 1º pomodoro (passo 5) abre com o card "Falta 1 passo" (telas.md, 17/11).
  const firstSubjectId = account.step === "concluido" ? null : await latestSubjectId();
  const to = homeRedirect(account.step, firstSubjectId);
  if (to) redirect(to);

  const [profile, game, badges, prefs, all, recent] = await Promise.all([
    getHomeProfile(user.id),
    getGameProfile(user.id),
    getBadgeHistory(),
    getPreferences(user.id),
    listSubjects(),
    getRecentFocusSessions(),
  ]);
  const tz = profile.timezone;
  const today = game.today;
  const socializer = account.bartle === "socializador";
  const [history, league, feed, received, sessions] = await Promise.all([
    getStudyHistory(tz),
    account.bartle === "competidor" ? getLeagueView(user.id) : Promise.resolve(null),
    socializer ? getFriendsFeed() : Promise.resolve([]),
    socializer ? getReceivedReactions() : Promise.resolve([]),
    // Sua semana e o melhor horário do Explorador (últimos 30 dias).
    getCompletedSessions(addDays(today, -29), tz),
  ]);
  const social = socializer
    ? {
        received: received.length,
        feed: feed.slice(0, 2).map((f) => ({
          id: f.id,
          username: f.username,
          type: f.type,
          payload: f.payload,
          when: whenLabel(f.at, new Date(), tz),
        })),
      }
    : null;
  const subjects = sortByLastStudied(all, history);
  const rewards = account.rewards;
  const focus = focusSummary(recent, tz, today);
  const goalSubject = subjects.find((s) => s.daily_goal);
  const goal = goalSubject?.daily_goal
    ? {
        title: goalSubject.title,
        target: goalSubject.daily_goal,
        done: focus.todayBySubject.get(goalSubject.id) ?? 0,
      }
    : null;
  const week = periodFor("semana", today);
  const weekSummary = periodSummary(sessions, week, tz);
  const weekBars = focusBars(sessions, week, tz, today);
  const best = bestHours(sessions, tz, today);
  // Fruto ainda não revelado na fila do layout (mesma janela de 60 dias).
  const pendingFruit = badges.some((b) => !b.seen && b.day >= addDays(today, -60));
  const away = daysAway(badges, today);
  const line = game.studiedToday
    ? null
    : homeLine({ daysAway: away ?? 0, freezeUsed: game.freezeUsed, streak: game.streak });

  const mastery = masteryMode(game.level);
  const mastered = masteryCounts(all);
  const { hour, dateLabel } = localParts(new Date(), tz);
  const empty = subjects.length === 0;
  const firstFruit =
    account.step === "pomodoro" ? all.find((s) => s.id === firstSubjectId) : undefined;
  const current = subjects[0];
  const hello = empty ? "Olá" : greeting(hour);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3 pt-2 lg:pt-0">
        <div className="flex flex-col gap-1">
          <p className="text-small text-ink-muted">{dateLabel}</p>
          <h1 className="font-display text-[28px] leading-9 font-semibold lg:text-[34px] lg:leading-10">
            {hello}
            {profile.name ? `, ${profile.name}` : ""}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatChip kind="ofensiva" value={game.streak} freezes={game.freezes} />
            {/* Nível 10+: destaque para o que a pessoa domina; o XP fica discreto (DESIGN §3). */}
            {mastery && <StatChip kind="topicos" value={mastered.topics} />}
            {mastery && mastered.chapters > 0 && (
              <StatChip kind="capitulos" value={mastered.chapters} />
            )}
            {/* Coorte B (DESIGN §9.4): sem XP e nível visíveis. */}
            {rewards && game.xp > 0 && <StatChip kind="xp" value={game.xp} muted={mastery} />}
            {rewards && <StatChip kind="nivel" value={game.level} />}
          </div>
        </div>
        {!empty && <SeuTomas size={52} className="shrink-0" />}
      </header>

      {line && <MascotBubble>{line}</MascotBubble>}

      {/* Painel (telas.md › Início como painel, 36 e 36b). Celular: uma coluna, na ordem
          do design; computador: à esquerda Continuar e Sua semana, à direita nível,
          fruto de ontem e destaque. As colunas são `contents` no celular para a ordem
          valer entre elas. */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-1 flex flex-col gap-5">
            {empty ? (
              <EmptyStart />
            ) : firstFruit ? (
              <FirstFruitCard subject={firstFruit} />
            ) : current ? (
              <ContinueCard
                subject={current}
                globalPace={prefs.globalPace}
                focusMin={prefs.focusMin}
              />
            ) : null}
          </div>
          <div className="order-5">
            <WeekCard summary={weekSummary} bars={weekBars} />
          </div>
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          {rewards && (
            <div className="order-2">
              <LevelCard xp={game.xp} history={badges} today={today} goal={goal} />
            </div>
          )}
          {rewards && (
            <div className="order-3 empty:hidden">
              <YesterdayFruitCard history={badges} today={today} pending={pendingFruit} />
            </div>
          )}
          <div className="order-4 empty:hidden">
            <ProfileHighlight
              account={account}
              xp={game.xp}
              history={badges}
              today={today}
              focus={focus}
              bestHour={best.start}
              league={league}
              social={social}
            />
          </div>
        </div>
      </div>

      {/* No celular, as Configurações ficam no fim do Início (no computador, na barra lateral). */}
      <Link
        href="/configuracoes"
        className="text-small text-ink-muted inline-flex min-h-11 items-center justify-center gap-2 self-center px-3 underline underline-offset-4 lg:hidden"
      >
        <Settings size={18} aria-hidden />
        Configurações
      </Link>
    </div>
  );
}

/** Sem disciplinas (01b): no lugar de "Continuar estudando". */
function EmptyStart() {
  return (
    <>
      <EmptyState
        title="Seu pomar ainda está vazio"
        action={
          <Link href="/disciplinas/nova" className={buttonClasses("primary", "lg")}>
            Criar minha primeira disciplina
          </Link>
        }
      >
        Escolha um livro do catálogo ou monte sua lista de capítulos. Eu calculo quanto tempo falta.
      </EmptyState>
      <section aria-labelledby="como-funciona" className="flex flex-col gap-4">
        <h2 id="como-funciona" className="text-caption text-ink-muted">
          Como funciona
        </h2>
        <ol className="flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <li key={step.strong} className="flex items-center gap-4">
              <span
                aria-hidden
                className="bg-primary-soft text-primary-strong font-display grid size-11 shrink-0 place-items-center rounded-full text-lg font-semibold"
              >
                {i + 1}
              </span>
              <p>
                <strong className="font-extrabold">{step.strong}</strong>
                {step.rest}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
