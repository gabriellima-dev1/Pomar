"use client";

import { OrchardTreeShape } from "@/components/scenes/OrchardTree";
import { Scene } from "@/components/scenes/Scene";
import { Button } from "@/components/ui/Button";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { ProgressBar } from "@/components/ui/Progress";
import { STAGE_LABEL, nextStage, progressToNext, stageForLevel } from "@/lib/gamification/levels";
import type { ThemeCode } from "@/lib/gamification/themes";
import { levelUpLine, stageChangePhrase } from "@/lib/mascot/lines";
import r from "./Rewards.module.css";

/**
 * "Subiu de nível" (tela 13), só quando a árvore muda de estágio (níveis 3, 6, 10, 15).
 * Cena sem véu, árvore nova grande ao centro e a anterior pequena e apagada à esquerda.
 */
export function LevelUpCelebration({
  from,
  to,
  xp,
  theme,
  onContinue,
}: {
  from: number;
  to: number;
  xp: number;
  theme: ThemeCode;
  onContinue: () => void;
}) {
  const before = stageForLevel(from);
  const after = stageForLevel(to);
  const p = progressToNext(xp);
  const next = nextStage(to);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nivel-titulo"
      className="fixed inset-0 z-50 overflow-y-auto bg-[var(--scene-sky-bottom)]"
    >
      <Scene theme={theme} orchard={false} />
      <svg
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <g transform="translate(78 600) scale(1.1)" opacity="0.45">
          <OrchardTreeShape stage={before} />
        </g>
        <path
          d="M110 560 q22 -14 44 -4 m-8 -9 l9 9 -12 4"
          fill="none"
          stroke="var(--scene-ink)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <g className={r.discIn} style={{ transformOrigin: "214px 600px" }}>
          <g transform="translate(214 600) scale(2.4)">
            <OrchardTreeShape stage={after} />
          </g>
        </g>
      </svg>

      <div className="max-w-app relative mx-auto flex min-h-full flex-col justify-between gap-6 p-4 pb-0">
        <div className="glass-panel mx-auto mt-8 flex w-full max-w-[320px] flex-col items-center gap-1 rounded-[28px] px-6 py-5 text-center text-[var(--scene-ink)]">
          <span className="text-caption">Novo nível</span>
          <h2 id="nivel-titulo" className="font-display text-[56px] leading-none font-semibold">
            Nível {to}
          </h2>
          <p className="font-extrabold">{stageChangePhrase(before, after)}</p>
        </div>

        <div
          className={`bg-surface-200 text-ink shadow-dialog -mx-4 flex flex-col gap-4 rounded-t-lg px-4 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] lg:mx-0 lg:mb-10 lg:rounded-lg lg:px-6 lg:pb-6 ${r.rise}`}
        >
          <MascotBubble>{levelUpLine(after)}</MascotBubble>
          <div className="border-line flex flex-col gap-2 rounded-lg border-2 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-extrabold">Rumo ao nível {p.level + 1}</span>
              <span className="text-reward-ink font-extrabold">
                {xp.toLocaleString("pt-BR")} XP
              </span>
            </div>
            <ProgressBar
              percent={p.ratio * 100}
              color="var(--reward)"
              label={`Progresso até o nível ${p.level + 1}`}
            />
            {next && (
              <p className="text-small text-ink-muted">
                Próxima fase da árvore:{" "}
                {STAGE_LABEL[next.stage].replace("Árvore ", "").toLowerCase()}, no nível{" "}
                {next.level}
              </p>
            )}
          </div>
          <Button size="lg" onClick={onContinue} autoFocus>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
