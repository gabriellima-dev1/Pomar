"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  markBadgesSeen,
  markLevelSeen,
  markThemeRevealSeen,
  setTheme,
} from "@/app/(app)/conquistas/actions";
import { useEffectiveTheme } from "@/components/theme/useEffectiveTheme";
import { Toast } from "@/components/ui/Toast";
import { stageChanged } from "@/lib/gamification/levels";
import type { BadgeDay } from "@/lib/gamification/present";
import type { ThemeCode } from "@/lib/gamification/themes";
import { FruitReveal } from "./FruitReveal";
import { LevelUpCelebration } from "./LevelUpCelebration";
import { ThemeUnlocked } from "./ThemeUnlocked";

/** Revelações mostradas por vez ao abrir o app (as mais antigas ficam só no álbum). */
const MAX_REVEALS = 7;

type Step =
  | { kind: "badge"; badge: BadgeDay }
  | { kind: "theme"; code: ThemeCode }
  | { kind: "level"; from: number; to: number };

/**
 * Fila de recompensas ao abrir o app (DECISOES 10/11): primeiro os frutos (tela 12,
 * do mais antigo ao mais novo), depois o tema desbloqueado (14), depois o nível (13
 * ou toast). Tudo foi calculado no servidor; aqui só se mostra e marca como visto.
 * Fica de fora do pomodoro, que mostra o próprio nível depois do fim do ciclo.
 */
export function RewardsQueue({
  badges,
  history,
  themes,
  levelFrom,
  levelTo,
  xp,
  today,
  theme,
}: {
  /** Emblemas ainda não revelados, do mais antigo ao mais novo. */
  badges: BadgeDay[];
  /** Histórico recente (colheita da semana em cada revelação). */
  history: BadgeDay[];
  /** Temas desbloqueados ainda não revelados. */
  themes: ThemeCode[];
  levelFrom: number;
  levelTo: number;
  xp: number;
  today: string;
  theme: ThemeCode | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sceneTheme = useEffectiveTheme(theme);
  const [steps, setSteps] = useState<Step[]>(() => [
    ...badges.slice(-MAX_REVEALS).map((badge): Step => ({ kind: "badge", badge })),
    ...themes.map((code): Step => ({ kind: "theme", code })),
    ...(levelTo > levelFrom ? [{ kind: "level", from: levelFrom, to: levelTo } as Step] : []),
  ]);
  const [busy, startTransition] = useTransition();

  const current = steps[0];
  const advance = useCallback(() => setSteps((s) => s.slice(1)), []);

  if (pathname.startsWith("/pomodoro")) return null;

  function seeAllBadges() {
    void markBadgesSeen(badges.map((b) => b.day));
  }

  return (
    <>
      {current?.kind === "badge" && (
        <FruitReveal
          key={current.badge.day}
          badge={current.badge}
          today={today}
          history={history}
          theme={sceneTheme}
          onHarvest={() => {
            const rest = steps.slice(1);
            void markBadgesSeen(
              rest.some((s) => s.kind === "badge") ? [current.badge.day] : badges.map((b) => b.day),
            );
            advance();
          }}
          onAlbum={() => {
            seeAllBadges();
            setSteps((s) => s.filter((x) => x.kind !== "badge"));
            router.push("/conquistas");
          }}
        />
      )}
      {current?.kind === "theme" && (
        <ThemeUnlocked
          theme={current.code}
          busy={busy}
          onUse={() =>
            startTransition(async () => {
              await setTheme(current.code);
              advance();
              router.refresh();
            })
          }
          onLater={() => {
            void markThemeRevealSeen(current.code);
            advance();
          }}
        />
      )}
      {current?.kind === "level" && !stageChanged(current.from, current.to) && (
        <LevelToast level={current.to} onDone={advance} />
      )}
      {current?.kind === "level" && stageChanged(current.from, current.to) && (
        <LevelUpCelebration
          from={current.from}
          to={current.to}
          xp={xp}
          theme={sceneTheme}
          onContinue={() => {
            void markLevelSeen(current.to);
            advance();
          }}
        />
      )}
    </>
  );
}

/** Nível sem troca de estágio: toast "Nível N!" por 3s (DECISOES 10/11). */
export function LevelToast({ level, onDone }: { level: number; onDone: () => void }) {
  useEffect(() => {
    void markLevelSeen(level);
  }, [level]);
  return <Toast open onDone={onDone} title={`Nível ${level}!`} />;
}
