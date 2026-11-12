import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PeopleSearch } from "@/components/social/PeopleSearch";
import { PersonRow } from "@/components/social/PersonRow";
import { cardClasses } from "@/components/ui/Card";
import { TopBar } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth/session";
import { DIVISION_LABEL } from "@/lib/league/divisions";
import { getLeagueView } from "@/lib/league/queries";
import { getLeagueSuggestions } from "@/lib/social/queries";

export const metadata: Metadata = { title: "Buscar pessoas" };

/** Buscar pessoas (referencias/27-buscar-pessoas.png) + sugestões "Da sua Feira". */
export default async function BuscarPage() {
  const user = await requireUser();
  const [view, suggestions] = await Promise.all([getLeagueView(user.id), getLeagueSuggestions()]);
  if (!view.username) redirect(`/liga/apelido?depois=${encodeURIComponent("/liga?aba=amigos")}`);

  const rankOf = new Map((view.group?.rows ?? []).map((r) => [r.username, r.rank]));
  const division = view.group ? DIVISION_LABEL[view.group.division] : null;

  return (
    <section className="flex flex-col gap-5">
      <TopBar backHref="/liga?aba=amigos" backLabel="Voltar para Amigos" />
      <PeopleSearch>
        {suggestions.length > 0 && (
          <section aria-labelledby="da-feira" className="flex flex-col gap-3">
            <h2 id="da-feira" className="text-caption text-ink-muted">
              Da sua Feira
            </h2>
            <ul className={`${cardClasses} flex flex-col px-4 py-2`}>
              {suggestions.map((p) => {
                const rank = rankOf.get(p.username);
                return (
                  <PersonRow
                    key={p.username}
                    username={p.username}
                    subtitle={
                      rank && division
                        ? `${rank}º lugar na Feira de ${division}`
                        : `Nível ${p.level}`
                    }
                    following={p.following}
                    isDemo={p.isDemo}
                  />
                );
              })}
            </ul>
          </section>
        )}
      </PeopleSearch>
    </section>
  );
}
