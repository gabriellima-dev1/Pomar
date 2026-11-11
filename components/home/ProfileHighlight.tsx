import Link from "next/link";
import { BarChart3, Sparkles, Users } from "lucide-react";
import { dismissLeagueInvite, setLeagueChoice } from "@/app/(onboarding)/onboarding/actions";
import { BadgeDisc } from "@/components/gamification/BadgeDisc";
import { SubmitButton } from "@/components/forms/fields";
import { DivisionDisc } from "@/components/league/Divisions";
import { ProgressBar } from "@/components/ui/Progress";
import { cardClasses } from "@/components/ui/Card";
import type { Account } from "@/lib/account";
import { formatMinutes, type FocusSummary } from "@/lib/focus-summary";
import { BADGES, badgeInfo } from "@/lib/gamification/catalog";
import { TIER_LABEL, tierForDays } from "@/lib/gamification/harvest";
import { progressToNext, xpForLevel } from "@/lib/gamification/levels";
import { badgesThisWeek, type BadgeDay } from "@/lib/gamification/present";

export type HighlightData = {
  account: Account;
  xp: number;
  history: readonly BadgeDay[];
  today: string;
  focus: FocusSummary;
  /** Disciplina com meta diária, na ordem do Início (a primeira vale). */
  goal: { title: string; target: number; done: number } | null;
};

const card = `${cardClasses} flex flex-col gap-4 p-5`;

function MiniStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-surface-100 flex flex-1 flex-col gap-0.5 rounded-md px-4 py-3">
      <span className="text-caption text-ink-muted">{label}</span>
      <span className="font-display text-[26px] leading-8 font-semibold">
        {value}
        {note && (
          <span className="text-small text-ink-muted font-sans font-semibold"> · {note}</span>
        )}
      </span>
    </div>
  );
}

/** Coorte B ou sem dados de jogo: só minutos de foco, sem XP nem emblemas. */
function FocusCard({ focus }: { focus: FocusSummary }) {
  return (
    <section aria-labelledby="destaque" className={card}>
      <h2 id="destaque" className="text-heading">
        Seu foco
      </h2>
      <div className="flex gap-3">
        <MiniStat label="Hoje" value={formatMinutes(focus.todayMin)} />
        <MiniStat label="Nesta semana" value={formatMinutes(focus.weekMin)} />
      </div>
    </section>
  );
}

function AchieverCard({ xp, history, today, goal }: HighlightData) {
  const p = progressToNext(xp);
  const week = badgesThisWeek(today, history);
  const tier = tierForDays(week);
  return (
    <section aria-labelledby="destaque" className={card}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="destaque" className="text-heading">
          Rumo ao nível {p.level + 1}
        </h2>
        <span className="text-small text-reward-mark font-extrabold tabular-nums">
          {xp} / {xpForLevel(p.level + 1)} XP
        </span>
      </div>
      <ProgressBar
        percent={p.ratio * 100}
        color="var(--reward)"
        label={`Faltam ${p.remaining} XP para o nível ${p.level + 1}`}
      />
      <div className="flex gap-3">
        {goal && <MiniStat label="Meta de hoje" value={`${goal.done} de ${goal.target}`} />}
        <MiniStat
          label="Colheita"
          value={`${week} de 7`}
          note={tier ? TIER_LABEL[tier] : undefined}
        />
      </div>
    </section>
  );
}

function ExplorerCard({ history, focus }: HighlightData) {
  const owned = new Set(history.map((b) => b.code));
  // Até 4 discos: obtidos primeiro (mais recentes), depois cadeados.
  const recent = [...history]
    .sort((a, b) => b.day.localeCompare(a.day))
    .map((b) => b.code)
    .filter((code, i, all) => all.indexOf(code) === i)
    .slice(0, 4);
  const missing = BADGES.filter((b) => !owned.has(b.code)).slice(0, 4 - recent.length);
  return (
    <section aria-labelledby="destaque" className={card}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="destaque" className="text-heading">
          Seu álbum: {owned.size} de {BADGES.length}
        </h2>
        <Link
          href="/conquistas"
          className="text-primary font-extrabold underline underline-offset-4"
        >
          Ver álbum
        </Link>
      </div>
      <ul className="flex gap-3" aria-label="Emblemas">
        {recent.map((code) => {
          const info = badgeInfo(code);
          if (!info) return null;
          return (
            <li key={code}>
              <BadgeDisc code={info.code} rarity={info.rarity} size={52} />
              <span className="sr-only">{info.name}</span>
            </li>
          );
        })}
        {missing.map((b) => (
          <li key={b.code}>
            <BadgeDisc
              code={b.code}
              rarity={b.rarity}
              state={b.hidden ? "secret" : "missing"}
              size={52}
            />
            <span className="sr-only">Emblema ainda não obtido</span>
          </li>
        ))}
      </ul>
      <p className="bg-surface-100 flex items-center gap-3 rounded-md px-4 py-3">
        <BarChart3 size={24} aria-hidden className="text-primary shrink-0" />
        <span>
          Minutos de foco nesta semana:{" "}
          <strong className="font-extrabold">{formatMinutes(focus.weekMin)}</strong>
        </span>
      </p>
    </section>
  );
}

function CompetitorCard(data: HighlightData) {
  const { account } = data;
  if (account.leagueOptIn) {
    return (
      <section aria-labelledby="destaque" className={card}>
        <div className="flex items-center gap-4">
          <DivisionDisc division="bronze" size={48} />
          <div className="flex flex-col">
            <h2 id="destaque" className="text-heading">
              Feira de Bronze
            </h2>
            <p className="text-small text-ink-muted">Sua primeira Feira começa em breve.</p>
          </div>
        </div>
        <p className="text-ink-muted">
          Você vai ficar num grupo com gente que estuda um tempo parecido com o seu. O ranking é
          pelo XP da semana.
        </p>
      </section>
    );
  }
  // Convite sem insistir: some depois de recusar 1 vez (telas.md › 21).
  if (account.leagueInviteDismissed) return <FocusCard focus={data.focus} />;
  return (
    <section aria-labelledby="destaque" className={card}>
      <div className="flex items-center gap-4">
        <DivisionDisc division="bronze" size={48} />
        <h2 id="destaque" className="text-heading">
          Quer entrar na Feira?
        </h2>
      </div>
      <p className="text-ink-muted">
        Um grupo de até 20 pessoas com um tempo de estudo parecido com o seu. Só aparecem o seu
        apelido e o seu XP da semana.
      </p>
      <div className="flex flex-wrap gap-3">
        <form action={setLeagueChoice}>
          <input type="hidden" name="feira" value="in" />
          <input type="hidden" name="contexto" value="inicio" />
          <SubmitButton pendingText="Salvando…">Quero entrar</SubmitButton>
        </form>
        <form action={dismissLeagueInvite}>
          <SubmitButton variant="ghost" pendingText="Ok…">
            Agora não
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}

function SocializerCard() {
  return (
    <section aria-labelledby="destaque" className={card}>
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="bg-primary-soft text-primary-strong grid size-12 shrink-0 place-items-center rounded-full"
        >
          <Users size={24} />
        </span>
        <h2 id="destaque" className="text-heading">
          Quem você segue
        </h2>
      </div>
      <p className="text-ink-muted">
        Em breve você poderá seguir colegas, ver as conquistas deles e mandar parabéns.
      </p>
    </section>
  );
}

function QuizInvite() {
  return (
    <section aria-labelledby="destaque" className={card}>
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="bg-primary-soft text-primary-strong grid size-12 shrink-0 place-items-center rounded-full"
        >
          <Sparkles size={24} />
        </span>
        <h2 id="destaque" className="text-heading">
          Qual é o seu jeito de estudar?
        </h2>
      </div>
      <p className="text-ink-muted">
        Responda 8 perguntas rápidas e eu destaco aqui o que mais combina com você.
      </p>
      <Link
        href="/onboarding/quiz"
        className="text-primary self-start font-extrabold underline underline-offset-4"
      >
        Fazer o quiz
      </Link>
    </section>
  );
}

/**
 * Card de destaque do Início conforme o perfil de Bartle (DESIGN §6.8, telas.md › 21),
 * nas versões "antes da Fase 5" (sem Feira e sem social ainda). Coorte B: Conquistador
 * e Explorador viram o resumo neutro do foco.
 */
export function ProfileHighlight(data: HighlightData) {
  const { account } = data;
  switch (account.bartle) {
    case "conquistador":
      return account.rewards ? <AchieverCard {...data} /> : <FocusCard focus={data.focus} />;
    case "explorador":
      return account.rewards ? <ExplorerCard {...data} /> : <FocusCard focus={data.focus} />;
    case "competidor":
      return <CompetitorCard {...data} />;
    case "socializador":
      return <SocializerCard />;
    default:
      return <QuizInvite />;
  }
}
