import { cardClasses } from "@/components/ui/Card";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { weekday } from "@/lib/dates";
import { badgeInfo } from "@/lib/gamification/catalog";
import { TIER_DAYS } from "@/lib/gamification/harvest";
import { weekRangeLabel, weekStrip, type BadgeDay } from "@/lib/gamification/present";
import { harvestLine } from "@/lib/mascot/lines";
import { BadgeIcon } from "./BadgeIcon";

const MARKS = [
  { label: "Bronze", days: TIER_DAYS.bronze, color: "var(--medal-bronze-ink)" },
  { label: "Prata", days: TIER_DAYS.prata, color: "var(--medal-prata-ink)" },
  { label: "Ouro", days: TIER_DAYS.ouro, color: "var(--reward-mark)" },
];

/** Card "ESTA SEMANA" (tela 10): 7 dias, barra 0–7 com as faixas e a próxima meta. */
export function HarvestWeekCard({
  history,
  today,
  studiedToday,
}: {
  history: readonly BadgeDay[];
  today: string;
  studiedToday: boolean;
}) {
  const days = weekStrip(today, history);
  const count = days.filter((d) => d.code).length;
  const daysLeft = 7 - ((weekday(today) + 6) % 7);
  return (
    <section aria-labelledby="semana-titulo" className={`${cardClasses} flex flex-col gap-5 p-5`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="semana-titulo" className="text-caption text-ink-muted">
          Esta semana
        </h2>
        <p className="text-small text-ink-muted">{weekRangeLabel(days[0]?.day ?? today)}</p>
      </div>

      <ol className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const info = d.code ? badgeInfo(d.code) : undefined;
          return (
            <li key={d.day} className="flex flex-col items-center gap-2">
              {info ? (
                <span
                  className="bg-reward text-on-reward grid aspect-square w-full max-w-10 place-items-center rounded-full"
                  title={info.name}
                >
                  <BadgeIcon code={info.code} size={20} />
                  <span className="sr-only">{info.name}</span>
                </span>
              ) : d.isToday ? (
                <span className="border-fruit bg-fruit-soft text-fruit grid aspect-square w-full max-w-10 place-items-center rounded-full border-2 border-dashed text-[11px] font-extrabold">
                  hoje
                </span>
              ) : (
                <span
                  aria-hidden
                  className="bg-surface-300 aspect-square w-full max-w-10 rounded-full"
                />
              )}
              <span aria-hidden className="text-small font-extrabold">
                {d.letter}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Dias com emblema nesta semana"
          aria-valuemin={0}
          aria-valuemax={7}
          aria-valuenow={count}
          aria-valuetext={`${count} de 7 dias`}
          className="bg-surface-300 h-3 w-full overflow-hidden rounded-full"
        >
          <div
            className="bg-fruit h-full rounded-full"
            style={{ width: `${(count / 7) * 100}%` }}
          />
        </div>
        <div className="text-small relative h-5 font-extrabold">
          {MARKS.map((m) => (
            <span
              key={m.label}
              className="absolute -translate-x-full whitespace-nowrap"
              style={{ left: `${(m.days / 7) * 100}%`, color: m.color }}
            >
              {m.label} · {m.days}
            </span>
          ))}
        </div>
      </div>

      <MascotBubble>{harvestLine(count, studiedToday, daysLeft)}</MascotBubble>
    </section>
  );
}
