import { TIER_LABEL, TIERS } from "@/lib/gamification/harvest";
import { weekRangeLabel, type PastWeek } from "@/lib/gamification/present";
import type { HarvestItem, UnlockedTheme } from "@/lib/gamification/queries";
import { THEMES } from "@/themes";
import { HarvestMedal, MedalDot } from "./HarvestMedal";

export function HarvestTotals({ harvests }: { harvests: readonly HarvestItem[] }) {
  const order = [...TIERS].reverse();
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="Total de colheitas">
      {order.map((tier) => {
        const n = harvests.filter((h) => h.tier === tier).length;
        return (
          <li
            key={tier}
            className="bg-surface-200 shadow-card flex min-h-12 items-center justify-center gap-2 rounded-full px-3 font-extrabold"
          >
            <MedalDot tier={tier} />
            {n} {TIER_LABEL[tier]}
          </li>
        );
      })}
    </ul>
  );
}

export function HarvestHistory({
  weeks,
  themes,
}: {
  weeks: PastWeek[];
  themes: readonly UnlockedTheme[];
}) {
  if (weeks.length === 0) return null;
  const themeByWeek = new Map(themes.filter((t) => t.sourceWeek).map((t) => [t.sourceWeek, t]));
  return (
    <section aria-labelledby="anteriores-titulo" className="flex flex-col gap-3">
      <h2 id="anteriores-titulo" className="text-caption text-ink-muted">
        Semanas anteriores
      </h2>
      <ul className="flex flex-col gap-3">
        {weeks.map((w) => {
          const theme = themeByWeek.get(w.weekStart);
          return (
            <li
              key={w.weekStart}
              className="bg-surface-200 shadow-card flex items-center gap-4 rounded-lg px-4 py-3"
            >
              <HarvestMedal tier={w.tier} />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className={`text-heading ${w.tier ? "" : "text-ink-muted"}`}>
                  {w.tier ? `Colheita de ${TIER_LABEL[w.tier]}` : "Semana mais leve"}
                </p>
                <p className="text-small text-ink-muted">
                  {weekRangeLabel(w.weekStart)} ·{" "}
                  {w.tier
                    ? `${w.days} dias`
                    : `${w.days} ${w.days === 1 ? "dia" : "dias"} com emblema`}
                </p>
              </div>
              {theme && (
                <span className="text-small bg-surface-300 rounded-full px-3 py-1 font-extrabold">
                  {THEMES[theme.code].name}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
