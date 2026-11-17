import { cardClasses } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { TIER_LABEL, tierForDays } from "@/lib/gamification/harvest";
import { progressToNext, xpForLevel } from "@/lib/gamification/levels";
import { badgesThisWeek, type BadgeDay } from "@/lib/gamification/present";
import { MiniStat } from "./ProfileHighlight";

/**
 * Nível e meta do Início (telas.md › Início como painel, item 3; 36 e 36b): barra até o
 * próximo nível, "Meta de hoje" (se alguma disciplina tem meta) e "Colheita N de 7".
 * Só na coorte A (DESIGN §9.4): na coorte B o card não aparece, nem a meta sozinha.
 */
export function LevelCard({
  xp,
  history,
  today,
  goal,
}: {
  xp: number;
  history: readonly BadgeDay[];
  today: string;
  /** Disciplina com meta diária (a estudada por último vale). */
  goal: { title: string; target: number; done: number } | null;
}) {
  const p = progressToNext(xp);
  const week = badgesThisWeek(today, history);
  const tier = tierForDays(week);
  return (
    <section aria-labelledby="rumo-ao-nivel" className={`${cardClasses} flex flex-col gap-4 p-5`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="rumo-ao-nivel" className="text-heading">
          Rumo ao nível {p.level + 1}
        </h2>
        <span className="text-small text-reward-ink font-extrabold tabular-nums">
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
