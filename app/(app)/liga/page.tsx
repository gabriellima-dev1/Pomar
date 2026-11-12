import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarClock, Search, Users } from "lucide-react";
import { setLeagueChoice } from "@/app/(onboarding)/onboarding/actions";
import { SubmitButton } from "@/components/forms/fields";
import { DivisionLadder, DivisionMedal } from "@/components/league/Divisions";
import { LeagueHeader, LeagueTable } from "@/components/league/LeagueBoard";
import { FeedList } from "@/components/social/FeedList";
import { ReactionBanner } from "@/components/social/ReactionBanner";
import { buttonClasses } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { requireUser } from "@/lib/auth/session";
import { getGameProfile } from "@/lib/gamification/queries";
import { DIVISION_LABEL } from "@/lib/league/divisions";
import { getLeagueView } from "@/lib/league/queries";
import { ensureLeagueRollover } from "@/lib/league/service";
import { closesIn } from "@/lib/league/week";
import { reactionBanner, whenLabel } from "@/lib/social/feed";
import { getFriendsFeed, getReceivedReactions } from "@/lib/social/queries";

export const metadata: Metadata = { title: "Liga" };

const card = `${cardClasses} flex flex-col gap-4 p-5`;

/** Quem não está na Feira: explicação + "Quero entrar" (telas.md › 23, sem insistir). */
function JoinCard() {
  return (
    <section aria-labelledby="feira-convite" className={card}>
      <h2 id="feira-convite" className="text-heading">
        O que é a Feira
      </h2>
      <p className="text-ink-muted">
        Toda semana, um grupo de até 20 pessoas que estudam um tempo parecido com o seu. O ranking é
        pelo XP da semana: os 5 primeiros sobem de Feira e todo mundo recomeça do zero na segunda.
        Só aparecem o seu apelido e o seu XP.
      </p>
      <DivisionLadder />
      <p className="text-small text-ink-muted">
        Participar é opcional e dá para sair quando quiser em Configurações.
      </p>
      <form action={setLeagueChoice} className="flex flex-col">
        <input type="hidden" name="feira" value="in" />
        <input type="hidden" name="contexto" value="liga" />
        <SubmitButton pendingText="Entrando…">Quero entrar</SubmitButton>
      </form>
    </section>
  );
}

function FirstLeagueSoon({ division }: { division: keyof typeof DIVISION_LABEL }) {
  return (
    <section aria-labelledby="feira-breve" className={card}>
      <div className="flex items-center gap-4">
        <DivisionMedal division={division} size={52} />
        <div className="flex flex-col">
          <h2 id="feira-breve" className="text-heading">
            Feira de {DIVISION_LABEL[division]}
          </h2>
          <p className="text-small text-ink-muted flex items-center gap-1.5 font-semibold">
            <CalendarClock size={16} aria-hidden />
            Sua primeira Feira começa na segunda
          </p>
        </div>
      </div>
      <p className="text-ink-muted">
        Na segunda, às 00:00, você entra num grupo com gente que estuda um tempo parecido com o seu.
        Até lá, cada pomodoro conta para o seu ritmo.
      </p>
    </section>
  );
}

/** Aba Amigos (referencias/26-liga-amigos.png): busca, parabéns recebidos e feed. */
async function FriendsTab({ userId }: { userId: string }) {
  const [feed, received, game] = await Promise.all([
    getFriendsFeed(),
    getReceivedReactions(),
    getGameProfile(userId),
  ]);
  const now = new Date();
  const banner = reactionBanner(received);
  return (
    <>
      <Link
        href="/liga/buscar"
        className="border-control-border bg-surface-200 text-ink-muted flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 text-lg font-semibold"
      >
        <Search size={24} aria-hidden className="shrink-0" />
        Buscar pessoas pelo apelido
      </Link>
      {banner && (
        <ReactionBanner
          lead={banner.lead}
          others={banner.others}
          prefix={banner.ref.prefix}
          name={banner.ref.name}
        />
      )}
      {feed.length > 0 ? (
        <section aria-labelledby="quem-segue" className="flex flex-col gap-3">
          <h2 id="quem-segue" className="text-caption text-ink-muted">
            Quem você segue
          </h2>
          <FeedList
            items={feed.map((f) => ({
              id: f.id,
              username: f.username,
              type: f.type,
              payload: f.payload,
              when: whenLabel(f.at, now, game.timezone),
              reacted: f.reacted,
            }))}
          />
        </section>
      ) : (
        <EmptyState
          title="Ninguém por aqui ainda"
          action={
            <Link href="/liga/buscar" className={buttonClasses("primary", "md")}>
              Buscar pessoas
            </Link>
          }
        >
          Siga colegas para ver as conquistas deles aqui. Só aparecem pessoas com perfil público.
        </EmptyState>
      )}
    </>
  );
}

/**
 * Liga (referencias/23 e 26): `Feira · Amigos`. Abre em Feira; abre em Amigos para
 * quem não está na Feira (telas.md › Onde fica o social). Apelido na primeira entrada
 * na Feira ou em Amigos (24).
 */
export default async function LigaPage({ searchParams }: PageProps<"/liga">) {
  const user = await requireUser();
  const { todos, aba } = await searchParams;

  // Rede de segurança: se o cron de segunda não rodou, a virada acontece agora.
  try {
    await ensureLeagueRollover();
  } catch (error) {
    console.error("[feira] rede de segurança", error);
  }

  const view = await getLeagueView(user.id);
  const tab = aba === "amigos" || aba === "feira" ? aba : view.optIn ? "feira" : "amigos";
  if (!view.username && (tab === "amigos" || view.optIn)) {
    const back = tab === "amigos" ? "/liga?aba=amigos" : "/liga";
    redirect(`/liga/apelido?depois=${encodeURIComponent(back)}`);
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-display pt-2">Liga</h1>
      <SegmentedNav
        label="Liga"
        items={[
          { label: "Feira", href: "/liga?aba=feira", active: tab === "feira" },
          { label: "Amigos", href: "/liga?aba=amigos", active: tab === "amigos" },
        ]}
      />

      {tab === "amigos" && <FriendsTab userId={user.id} />}

      {tab === "feira" && !view.optIn && <JoinCard />}
      {tab === "feira" && view.optIn && !view.group && <FirstLeagueSoon division={view.division} />}
      {tab === "feira" && view.optIn && view.group && (
        <>
          <LeagueHeader group={view.group} closesIn={closesIn(new Date(), view.group.week)} />
          <LeagueTable
            group={view.group}
            showAll={todos === "1"}
            allHref="/liga?aba=feira&todos=1"
            lessHref="/liga?aba=feira"
            profileLinks
          />
        </>
      )}

      {view.username && (
        <p className="text-small text-ink-muted flex items-center gap-2">
          <Users size={16} aria-hidden />
          Você aparece como <strong className="text-ink font-extrabold">@{view.username}</strong>.
          <Link
            href={`/perfil/${view.username}`}
            className="text-primary font-extrabold underline underline-offset-4"
          >
            Ver meu perfil
          </Link>
        </p>
      )}
    </section>
  );
}
