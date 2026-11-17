import Link from "next/link";
import { Clock, Sparkles, Users } from "lucide-react";
import { dismissLeagueInvite, setLeagueChoice } from "@/app/(onboarding)/onboarding/actions";
import { BadgeDisc } from "@/components/gamification/BadgeDisc";
import { SubmitButton } from "@/components/forms/fields";
import { DivisionDisc, DivisionMedal } from "@/components/league/Divisions";
import { cardClasses } from "@/components/ui/Card";
import type { Account } from "@/lib/account";
import { formatMinutes, type FocusSummary } from "@/lib/focus-summary";
import { BADGES, badgeInfo } from "@/lib/gamification/catalog";
import type { BadgeDay } from "@/lib/gamification/present";
import { DIVISION_LABEL } from "@/lib/league/divisions";
import { chaseLine } from "@/lib/league/present";
import type { LeagueView } from "@/lib/league/queries";
import { feedText, type FeedPayload, type FeedType } from "@/lib/social/feed";
import { zones } from "@/lib/league/ranking";

export type HighlightData = {
  account: Account;
  xp: number;
  history: readonly BadgeDay[];
  today: string;
  focus: FocusSummary;
  /** Início da faixa de 2 h com mais foco nos últimos 30 dias (Explorador, tela 21). */
  bestHour: number | null;
  /** Feira da pessoa (só carregada para o Competidor). */
  league?: LeagueView | null;
  /** Social (só carregado para o Socializador). */
  social?: {
    received: number;
    feed: { id: string; username: string; type: FeedType; payload: FeedPayload; when: string }[];
  } | null;
};

const card = `${cardClasses} flex flex-col gap-4 p-5`;

export function MiniStat({ label, value, note }: { label: string; value: string; note?: string }) {
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

function ExplorerCard({ history, bestHour }: HighlightData) {
  const owned = new Set(history.map((b) => b.code));
  // Até 4 discos: obtidos primeiro (mais recentes), depois cadeados (referencias/21).
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
            <BadgeDisc code={b.code} rarity={b.rarity} state="secret" size={52} />
            <span className="sr-only">Emblema ainda não obtido</span>
          </li>
        ))}
      </ul>
      <p className="bg-surface-100 flex items-center gap-3 rounded-md px-4 py-3">
        <Clock size={24} aria-hidden className="text-primary shrink-0" />
        {bestHour === null ? (
          <span>Conclua alguns pomodoros e eu descubro o seu melhor horário de foco.</span>
        ) : (
          <span>
            Seu melhor horário de foco:{" "}
            <strong className="font-extrabold">
              {bestHour}h–{bestHour + 2}h
            </strong>
          </span>
        )}
      </p>
    </section>
  );
}

function CompetitorCard(data: HighlightData) {
  const { account, league } = data;
  const group = league?.group;
  if (account.leagueOptIn && group && !group.me) {
    return (
      <section aria-labelledby="destaque" className={card}>
        <div className="flex items-center gap-4">
          <DivisionMedal division={group.division} size={48} />
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 id="destaque" className="text-heading">
              Feira de {DIVISION_LABEL[group.division]}
            </h2>
            <p className="text-small text-ink-muted font-semibold">
              {group.rows.length === 1 ? "1 pessoa" : `${group.rows.length} pessoas`} no ranking
              desta semana
            </p>
          </div>
        </div>
        <p>Conclua um pomodoro para entrar no ranking desta semana.</p>
        <Link
          href="/liga"
          className="text-primary self-start font-extrabold underline underline-offset-4"
        >
          Ver a Feira
        </Link>
      </section>
    );
  }
  if (account.leagueOptIn && group?.me) {
    const me = group.me;
    const z = zones(group.rows.length, group.division);
    const inUp = me.rank <= z.up;
    const inDown = z.down > 0 && me.rank > group.rows.length - z.down;
    return (
      <section aria-labelledby="destaque" className={card}>
        <div className="flex items-center gap-4">
          <DivisionMedal division={group.division} size={48} />
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 id="destaque" className="text-heading">
              {me.rank}º na Feira de {DIVISION_LABEL[group.division]}
            </h2>
            <p className="text-small text-ink-muted font-semibold">
              {me.xp} XP nesta semana · {group.rows.length} pessoas
            </p>
          </div>
        </div>
        <p>{chaseLine(group.rows)}</p>
        {(inUp || inDown) && (
          <p
            className={`text-small rounded-md px-4 py-3 font-extrabold ${inUp ? "bg-primary-soft text-primary-strong" : "bg-surface-100 text-ink-muted"}`}
          >
            {inUp
              ? "Você está na zona de subida. Se a semana fechar agora, você sobe de Feira."
              : "Mais alguns pomodoros e você sai da zona de descida."}
          </p>
        )}
        <Link
          href="/liga"
          className="text-primary self-start font-extrabold underline underline-offset-4"
        >
          Ver a Feira
        </Link>
      </section>
    );
  }
  if (account.leagueOptIn) {
    const division = league?.division ?? "bronze";
    return (
      <section aria-labelledby="destaque" className={card}>
        <div className="flex items-center gap-4">
          <DivisionMedal division={division} size={48} />
          <div className="flex flex-col">
            <h2 id="destaque" className="text-heading">
              Feira de {DIVISION_LABEL[division]}
            </h2>
            <p className="text-small text-ink-muted">Sua primeira Feira começa na segunda.</p>
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

function SocializerCard({ social }: HighlightData) {
  const feed = social?.feed ?? [];
  const received = social?.received ?? 0;
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
      {received > 0 && (
        <p className="bg-fruit-soft rounded-md px-4 py-3 font-semibold">
          {received === 1 ? "1 parabéns novo" : `${received} parabéns novos`} para você.
        </p>
      )}
      {feed.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {feed.map((f) => {
            const t = feedText(f.type, f.payload);
            return (
              <li key={f.id} className="bg-surface-100 rounded-md px-4 py-3">
                <strong className="font-extrabold">{f.username}</strong> {t.text}
                {t.strong && <strong className="font-extrabold">{t.strong}</strong>}
                <span className="text-small text-ink-muted block font-semibold">{f.when}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-ink-muted">
          Siga colegas para ver as conquistas deles e mandar parabéns.
        </p>
      )}
      <Link
        href={feed.length > 0 ? "/liga?aba=amigos" : "/liga/buscar"}
        className="text-primary self-start font-extrabold underline underline-offset-4"
      >
        {feed.length > 0 ? "Ver tudo em Amigos" : "Buscar pessoas"}
      </Link>
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
 * com a Feira da Fase 5 no Competidor. Coorte B: Conquistador e Explorador viram o
 * resumo neutro do foco. Coorte A: o Conquistador não tem destaque, porque o card de
 * nível e meta (LevelCard) já é o dele (telas.md › Início como painel).
 */
export function ProfileHighlight(data: HighlightData) {
  const { account } = data;
  switch (account.bartle) {
    case "conquistador":
      // Coorte A: o card "Rumo ao nível" do Início já é o destaque dele (DECISOES 17/11).
      return account.rewards ? null : <FocusCard focus={data.focus} />;
    case "explorador":
      return account.rewards ? <ExplorerCard {...data} /> : <FocusCard focus={data.focus} />;
    case "competidor":
      return <CompetitorCard {...data} />;
    case "socializador":
      return <SocializerCard {...data} />;
    default:
      return <QuizInvite />;
  }
}
