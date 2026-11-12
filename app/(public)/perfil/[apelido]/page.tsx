import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flame, Lock } from "lucide-react";
import { BadgeDisc } from "@/components/gamification/BadgeDisc";
import { Scene } from "@/components/scenes/Scene";
import { Avatar } from "@/components/social/Avatar";
import { FollowButton } from "@/components/social/FollowButton";
import { levelLine } from "@/components/social/PersonRow";
import { cardClasses } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TopBar } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth/session";
import { BADGES, badgeInfo } from "@/lib/gamification/catalog";
import { stageForLevel } from "@/lib/gamification/levels";
import { getGameProfile } from "@/lib/gamification/queries";
import { dayLabelShort, profileAchievement } from "@/lib/social/feed";
import { getPublicProfile } from "@/lib/social/queries";

export const metadata: Metadata = { title: "Perfil" };

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function since(iso: string, timeZone: string): string {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" })
    .format(new Date(iso))
    .split("-");
  return `${MONTHS[Number(m) - 1]} de ${y}`;
}

/**
 * Perfil público (referencias/28-perfil-publico.png): árvore do estágio, nível,
 * ofensiva, emblemas e conquistas recentes. Nada de disciplinas, horas ou páginas
 * (DESIGN §4.7). Perfil não público responde "Este perfil é privado".
 */
export default async function PerfilPage({ params }: PageProps<"/perfil/[apelido]">) {
  const user = await requireUser();
  const { apelido } = await params;
  const [profile, game] = await Promise.all([
    getPublicProfile(decodeURIComponent(apelido)),
    getGameProfile(user.id),
  ]);
  if (!profile) notFound();

  if (profile.privado) {
    return (
      <section className="flex flex-col gap-5">
        <TopBar backHref="/liga?aba=amigos" backLabel="Voltar" />
        <EmptyState title="Este perfil é privado">
          <span className="inline-flex items-center gap-2">
            <Lock size={18} aria-hidden />
            Só a própria pessoa vê o nível, a árvore e os emblemas dela.
          </span>
        </EmptyState>
      </section>
    );
  }

  const owned = BADGES.filter((b) => profile.badges.includes(b.code));
  const now = new Date();

  return (
    <section className="-mx-4 -mt-4 flex flex-col gap-5 lg:mx-0 lg:mt-0">
      <div
        data-theme="classico"
        className="relative aspect-[390/230] w-full overflow-hidden bg-[var(--scene-sky-bottom)] lg:rounded-lg"
      >
        <Scene
          theme="classico"
          stage={stageForLevel(profile.level)}
          progress={1}
          still
          viewBox="0 250 390 330"
          preserveAspectRatio="xMidYMid slice"
        />
        <div className="absolute top-2 left-4">
          <TopBar backHref="/liga?aba=amigos" backLabel="Voltar" />
        </div>
      </div>

      <div className="-mt-16 flex flex-col gap-5 px-4 lg:px-0">
        <div className="flex items-end gap-4">
          <span className="border-surface-100 rounded-full border-4">
            <Avatar username={profile.username} size={84} />
          </span>
          <div className="flex min-w-0 flex-col pb-1">
            <h1 className="font-display truncate text-[30px] leading-9 font-semibold">
              @{profile.username}
            </h1>
            <p className="text-ink-muted font-semibold">
              {levelLine(profile.level)}
              {profile.isDemo && " · demo"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {profile.isMe ? (
            <span className="bg-surface-300 text-ink-muted flex min-h-12 items-center justify-center rounded-md px-3 text-center font-extrabold">
              Este é você
            </span>
          ) : (
            <FollowButton
              username={profile.username}
              initialFollowing={profile.following}
              variant="outline"
            />
          )}
          <p className="bg-surface-200 flex min-h-12 items-center justify-center gap-2 rounded-md px-3 font-extrabold">
            <Flame size={20} aria-hidden className="text-fruit shrink-0" />
            {profile.streak === 1 ? "1 dia" : `${profile.streak} dias`} de ofensiva
          </p>
        </div>

        <section aria-labelledby="emblemas" className={`${cardClasses} flex flex-col gap-4 p-5`}>
          <div className="flex items-baseline justify-between">
            <h2 id="emblemas" className="text-caption text-ink-muted">
              Emblemas
            </h2>
            <span className="text-ink-muted font-extrabold">
              {owned.length} de {BADGES.length}
            </span>
          </div>
          {owned.length === 0 ? (
            <p className="text-ink-muted">Nenhum emblema ainda.</p>
          ) : (
            <ul className="flex flex-wrap gap-3" aria-label="Emblemas obtidos">
              {owned.map((b) => (
                <li key={b.code}>
                  <BadgeDisc code={b.code} rarity={b.rarity} size={52} />
                  <span className="sr-only">{badgeInfo(b.code)?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {profile.recent.length > 0 && (
          <section aria-labelledby="recentes" className={`${cardClasses} flex flex-col gap-3 p-5`}>
            <h2 id="recentes" className="text-caption text-ink-muted">
              Conquistas recentes
            </h2>
            <ul className="flex flex-col gap-2">
              {profile.recent.map((r, i) => {
                const a = profileAchievement(r.type, r.payload);
                return (
                  <li key={i}>
                    {a.title}
                    <span className="text-small text-ink-muted font-semibold">
                      {" · "}
                      {a.note ?? dayLabelShort(r.at, now, game.timezone)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="text-small text-ink-muted text-center font-semibold">
          No Pomar desde {since(profile.createdAt, game.timezone)}
        </p>
      </div>
    </section>
  );
}
