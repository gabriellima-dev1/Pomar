import Link from "next/link";
import { cardClasses } from "@/components/ui/Card";
import { badgeInfo } from "@/lib/gamification/catalog";
import { badgesThisWeek, shortDate, weekStrip, type BadgeDay } from "@/lib/gamification/present";
import { addDays } from "@/lib/dates";
import { BadgeDisc } from "./BadgeDisc";
import { HarvestButton } from "./HarvestButton";
import { WeekDots } from "./WeekDots";

/**
 * Card "FRUTO DE ONTEM" do Início (tela 01): emblema mais recente + 7 bolinhas da
 * colheita da semana. Some se ainda não houver emblema.
 * Com fruto ainda não revelado (`pending`), o disco fica "a descobrir", o nome vira
 * "Toque para colher" e o toque reabre a fila (telas.md › 12, revisão de 16/11);
 * sem pendência, abre o álbum (09).
 */
export function YesterdayFruitCard({
  history,
  today,
  pending = false,
}: {
  history: readonly BadgeDay[];
  today: string;
  /** Há fruto na fila de recompensas ainda não visto. */
  pending?: boolean;
}) {
  const last = [...history].sort((a, b) => a.day.localeCompare(b.day)).at(-1);
  const info = last ? badgeInfo(last.code) : undefined;
  if (!last || !info) return null;
  const isYesterday = last.day === addDays(today, -1);
  const count = badgesThisWeek(today, history);
  const className = `${cardClasses} flex w-full items-center gap-4 p-4 text-left hover:brightness-[0.98]`;
  const content = (
    <>
      <span className="rounded-full p-1" style={{ boxShadow: "0 0 0 2px var(--reward-mark)" }}>
        <BadgeDisc
          code={info.code}
          rarity={info.rarity}
          state={pending ? "secret" : "obtained"}
          size={52}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-caption text-ink-muted">
          {isYesterday ? "Fruto de ontem" : `Último fruto · ${shortDate(last.day)}`}
        </span>
        <span className={`text-heading ${pending ? "text-primary" : ""}`}>
          {pending ? "Toque para colher" : info.name}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <WeekDots days={weekStrip(today, history)} size={12} />
          <span className="text-small text-ink-muted">Colheita da semana: {count} de 7</span>
        </span>
      </span>
    </>
  );
  return pending ? (
    <HarvestButton className={className}>{content}</HarvestButton>
  ) : (
    <Link href="/conquistas" className={className}>
      {content}
    </Link>
  );
}
