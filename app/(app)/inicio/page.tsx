import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { YesterdayFruitCard } from "@/components/gamification/YesterdayFruitCard";
import { ProfileHighlight } from "@/components/home/ProfileHighlight";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { StatChip } from "@/components/ui/StatChip";
import { getAccount, latestSubjectId } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { focusSummary } from "@/lib/focus-summary";
import { getLeagueView } from "@/lib/league/queries";
import { whenLabel } from "@/lib/social/feed";
import { getFriendsFeed, getReceivedReactions } from "@/lib/social/queries";
import { daysAway } from "@/lib/gamification/present";
import { getBadgeHistory, getGameProfile } from "@/lib/gamification/queries";
import { homeLine } from "@/lib/mascot/lines";
import { isOnboarding, pathForStep } from "@/lib/onboarding";
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
  // Até terminar o onboarding, o Início leva ao passo atual (telas.md › Fluxo do onboarding).
  if (isOnboarding(account.step)) redirect(pathForStep(account.step, await latestSubjectId()));

  const [profile, game, badges, prefs, all, recent] = await Promise.all([
    getHomeProfile(user.id),
    getGameProfile(user.id),
    getBadgeHistory(),
    getPreferences(user.id),
    listSubjects(),
    getRecentFocusSessions(),
  ]);
  const socializer = account.bartle === "socializador";
  const [history, league, feed, received] = await Promise.all([
    getStudyHistory(profile.timezone),
    account.bartle === "competidor" ? getLeagueView(user.id) : Promise.resolve(null),
    socializer ? getFriendsFeed() : Promise.resolve([]),
    socializer ? getReceivedReactions() : Promise.resolve([]),
  ]);
  const social = socializer
    ? {
        received: received.length,
        feed: feed.slice(0, 2).map((f) => ({
          id: f.id,
          username: f.username,
          type: f.type,
          payload: f.payload,
          when: whenLabel(f.at, new Date(), profile.timezone),
        })),
      }
    : null;
  const subjects = sortByLastStudied(all, history);
  const today = game.today;
  const rewards = account.rewards;
  const focus = focusSummary(recent, profile.timezone, today);
  const goalSubject = subjects.find((s) => s.daily_goal);
  const goal = goalSubject?.daily_goal
    ? {
        title: goalSubject.title,
        target: goalSubject.daily_goal,
        done: focus.todayBySubject.get(goalSubject.id) ?? 0,
      }
    : null;
  const away = daysAway(badges, today);
  const line = game.studiedToday
    ? null
    : homeLine({ daysAway: away ?? 0, freezeUsed: game.freezeUsed, streak: game.streak });

  const { hour, dateLabel } = localParts(new Date(), profile.timezone);
  const empty = subjects.length === 0;
  const hello = empty ? "Olá" : greeting(hour);

  return (
    <div className="flex flex-col gap-6">
      {/* Computador: saudação à esquerda e chips à direita (referencias/22). */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <header className="flex items-start justify-between gap-3 pt-2 lg:pt-0">
          <div className="flex flex-col gap-1">
            <p className="text-small text-ink-muted">{dateLabel}</p>
            <h1 className="font-display text-[28px] leading-9 font-semibold">
              {hello}
              {profile.name ? `, ${profile.name}` : ""}
            </h1>
          </div>
          {!empty && <SeuTomas size={52} className="shrink-0 lg:hidden" />}
        </header>

        <div className="flex flex-wrap gap-2">
          <StatChip kind="ofensiva" value={game.streak} freezes={game.freezes} />
          {/* Coorte B (DESIGN §9.4): sem XP e nível visíveis. */}
          {rewards && game.xp > 0 && <StatChip kind="xp" value={game.xp} />}
          {rewards && <StatChip kind="nivel" value={game.level} />}
        </div>
      </div>

      {line && <MascotBubble>{line}</MascotBubble>}
      {!empty && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
          <ProfileHighlight
            account={account}
            xp={game.xp}
            history={badges}
            today={today}
            focus={focus}
            goal={goal}
            league={league}
            social={social}
          />
          {rewards && <YesterdayFruitCard history={badges} today={today} />}
        </div>
      )}

      {empty ? (
        <>
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
      ) : (
        <section aria-labelledby="suas-disciplinas" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="suas-disciplinas" className="text-heading">
              Suas disciplinas
            </h2>
            <Link
              href="/disciplinas/nova"
              className="text-primary inline-flex min-h-11 items-center gap-1 px-1 font-extrabold"
            >
              <Plus size={22} aria-hidden />
              Nova
              <span className="sr-only"> disciplina</span>
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {subjects.map((s) => (
              <li key={s.id}>
                <SubjectCard
                  subject={s}
                  globalPace={prefs.globalPace}
                  history={history.get(s.id)}
                  today={today}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

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
