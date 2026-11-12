import Link from "next/link";
import { Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Avatar } from "@/components/social/Avatar";
import { cardClasses } from "@/components/ui/Card";
import { groupSubtitle } from "@/lib/league/bands";
import { DIVISION_LABEL, nextDivision, previousDivision } from "@/lib/league/divisions";
import { MIN_FOR_ZONES } from "@/lib/league/grouping";
import type { LeagueGroupView, LeagueRow } from "@/lib/league/queries";
import { dividerAfter, visibleWindow } from "@/lib/league/present";
import { zones } from "@/lib/league/ranking";
import { DivisionMedal } from "./Divisions";

/** Card da divisão (telas.md › 23): medalha, nome, faixa do grupo e "FECHA EM". */
export function LeagueHeader({ group, closesIn }: { group: LeagueGroupView; closesIn: string }) {
  return (
    <section
      aria-labelledby="feira-nome"
      className={`${cardClasses} flex items-center gap-4 px-5 py-4`}
    >
      <DivisionMedal division={group.division} size={52} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 id="feira-nome" className="text-heading">
          Feira de {DIVISION_LABEL[group.division]}
        </h2>
        <p className="text-small text-ink-muted font-semibold">
          {group.rows.length > 0
            ? groupSubtitle(group.rows.length, group.bandMin, group.bandMax)
            : "Ninguém entrou no ranking desta semana ainda"}
        </p>
      </div>
      <p className="flex shrink-0 flex-col items-end text-right">
        <span className="text-caption text-ink-muted">Fecha em</span>
        <span className="font-display text-[26px] leading-8 font-semibold tabular-nums">
          {closesIn}
        </span>
      </p>
    </section>
  );
}

function Row({
  row,
  inUpZone,
  profileLinks,
}: {
  row: LeagueRow;
  inUpZone: boolean;
  profileLinks: boolean;
}) {
  const name = row.isMe ? "Você" : (row.username ?? "Participante");
  const content = (
    <>
      <span
        className={`w-6 shrink-0 text-lg font-extrabold tabular-nums ${inUpZone ? "text-primary-strong" : "text-ink-muted"}`}
      >
        {row.rank}
      </span>
      <Avatar username={row.username} size={40} me={row.isMe} />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className={`truncate ${row.isMe ? "font-extrabold" : "font-semibold"}`}>{name}</span>
        {row.isDemo && (
          <span className="bg-surface-300 text-ink-muted text-small shrink-0 rounded-full px-2.5 py-0.5 font-extrabold">
            demo
          </span>
        )}
      </span>
      <span className="shrink-0 font-extrabold tabular-nums">{row.xp} XP</span>
    </>
  );
  const cls = `flex min-h-14 items-center gap-3 rounded-md px-3 ${row.isMe ? "bg-fruit-soft" : ""}`;
  return (
    <li aria-current={row.isMe ? "true" : undefined}>
      {profileLinks && !row.isMe && row.publicProfile && row.username ? (
        <Link
          href={`/perfil/${row.username}`}
          className={`${cls} hover:bg-surface-100`}
          aria-label={`${row.rank}º, ${name}, ${row.xp} XP. Ver perfil`}
        >
          {content}
        </Link>
      ) : (
        <div className={cls}>{content}</div>
      )}
    </li>
  );
}

function ZoneDivider({ kind, text }: { kind: "up" | "down"; text: string }) {
  const Icon = kind === "up" ? ArrowUp : ArrowDown;
  return (
    <li
      className={`text-caption flex items-center gap-2 px-3 py-2 ${kind === "up" ? "text-primary-strong" : "text-ink-muted"}`}
    >
      <Icon size={18} aria-hidden strokeWidth={2.5} />
      <span className="shrink-0">{text}</span>
      <span aria-hidden className="bg-line h-0.5 flex-1 rounded-full" />
    </li>
  );
}

/**
 * Ranking por XP da semana (telas.md › 23): até 8 linhas em volta da pessoa, divisórias
 * de zona (só com 10 ou mais no ranking) e "Ver o grupo todo". Como no Duolingo, só
 * aparece quem ganhou XP na semana; quem ainda não ganhou vê o convite para entrar.
 */
export function LeagueTable({
  group,
  showAll,
  allHref,
  lessHref,
  profileLinks = false,
}: {
  group: LeagueGroupView;
  showAll: boolean;
  allHref: string;
  lessHref: string;
  /** Tocar num apelido com perfil público abre o perfil (28). */
  profileLinks?: boolean;
}) {
  const { rows, division } = group;
  const size = rows.length;
  const [start, end] = showAll ? [0, size] : visibleWindow(size, (group.me?.rank ?? 1) - 1);
  const next = nextDivision(division);
  const previous = previousDivision(division);
  const z = zones(size, division);

  return (
    <section aria-label="Ranking da semana" className={`${cardClasses} flex flex-col gap-3 p-3`}>
      {!group.me && (
        <p className="bg-fruit-soft text-ink rounded-md px-4 py-3 font-semibold">
          Conclua um pomodoro para entrar no ranking desta semana. Até lá, você não sobe nem desce.
        </p>
      )}
      {size > 0 && (
        <ol className="flex flex-col gap-1">
          {rows.slice(start, end).map((row) => {
            const divider = dividerAfter(row.rank, size, division, next, previous);
            return (
              <Fragment key={row.userId}>
                <Row row={row} inUpZone={row.rank <= z.up} profileLinks={profileLinks} />
                {divider && row.rank < end && <ZoneDivider {...divider} />}
              </Fragment>
            );
          })}
        </ol>
      )}
      {size > 0 && size < MIN_FOR_ZONES && (
        <p className="text-small text-ink-muted px-3">
          Com menos de 10 pessoas no ranking, ninguém sobe nem desce nesta semana.
        </p>
      )}
      {size > end - start && (
        <Link
          href={allHref}
          className="bg-surface-100 text-primary flex min-h-12 items-center justify-center rounded-md font-extrabold"
        >
          Ver o grupo todo ({size})
        </Link>
      )}
      {showAll && size > 8 && (
        <Link
          href={lessHref}
          className="text-primary flex min-h-12 items-center justify-center rounded-md font-extrabold"
        >
          Mostrar menos
        </Link>
      )}
    </section>
  );
}
