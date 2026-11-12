import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarClock, Users } from "lucide-react";
import { setLeagueChoice } from "@/app/(onboarding)/onboarding/actions";
import { SubmitButton } from "@/components/forms/fields";
import { DivisionLadder, DivisionMedal } from "@/components/league/Divisions";
import { LeagueHeader, LeagueTable } from "@/components/league/LeagueBoard";
import { cardClasses } from "@/components/ui/Card";
import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { requireUser } from "@/lib/auth/session";
import { DIVISION_LABEL } from "@/lib/league/divisions";
import { getLeagueView } from "@/lib/league/queries";
import { ensureLeagueRollover } from "@/lib/league/service";
import { closesIn } from "@/lib/league/week";

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

/**
 * Liga (referencias/23-liga-feira.png): `Feira · Amigos`. A Feira mostra o grupo da
 * semana com o ranking por XP; Amigos chega com o social (Fase 5, PR 2).
 */
export default async function LigaPage({ searchParams }: PageProps<"/liga">) {
  const user = await requireUser();
  const { todos } = await searchParams;

  // Rede de segurança: se o cron de segunda não rodou, a virada acontece agora.
  try {
    await ensureLeagueRollover();
  } catch (error) {
    console.error("[feira] rede de segurança", error);
  }

  const view = await getLeagueView(user.id);
  // Apelido na primeira entrada na Feira (telas.md › 24).
  if (view.optIn && !view.username) redirect("/liga/apelido?depois=/liga");

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-display pt-2">Liga</h1>
      <SegmentedNav
        label="Liga"
        items={[
          { label: "Feira", href: "/liga", active: true },
          { label: "Amigos", hint: "em breve" },
        ]}
      />

      {!view.optIn && <JoinCard />}
      {view.optIn && !view.group && <FirstLeagueSoon division={view.division} />}
      {view.optIn && view.group && (
        <>
          <LeagueHeader group={view.group} closesIn={closesIn(new Date(), view.group.week)} />
          <LeagueTable
            group={view.group}
            showAll={todos === "1"}
            allHref="/liga?todos=1"
            lessHref="/liga"
          />
        </>
      )}

      {view.optIn && view.username && (
        <p className="text-small text-ink-muted flex items-center gap-2">
          <Users size={16} aria-hidden />
          Você aparece como <strong className="text-ink font-extrabold">@{view.username}</strong>.
        </p>
      )}
    </section>
  );
}
