import { MiniTree } from "@/components/scenes/OrchardTree";
import { cardClasses } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";
import { STAGE_LABEL, progressToNext, stageForLevel } from "@/lib/gamification/levels";

/** Card de nível (tela 09): mini-árvore do estágio, nível, XP e barra até o próximo. */
export function LevelCard({ xp }: { xp: number }) {
  const p = progressToNext(xp);
  const stage = stageForLevel(p.level);
  return (
    <section aria-label="Seu nível" className={`${cardClasses} flex items-center gap-4 p-4`}>
      <MiniTree stage={stage} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <p className="font-display text-[26px] leading-8 font-semibold">
            Nível {p.level}
            <span className="text-ink-muted font-sans text-base font-extrabold">
              {" "}
              · {STAGE_LABEL[stage]}
            </span>
          </p>
          <p className="text-reward-mark font-extrabold">{xp.toLocaleString("pt-BR")} XP</p>
        </div>
        <ProgressBar
          percent={p.ratio * 100}
          color="var(--reward)"
          label={`Progresso até o nível ${p.level + 1}`}
        />
        <p className="text-small text-ink-muted">
          Faltam {p.remaining.toLocaleString("pt-BR")} XP para o nível {p.level + 1}
        </p>
      </div>
    </section>
  );
}
