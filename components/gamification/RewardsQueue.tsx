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
import { markWeekResultSeen } from "@/app/(app)/liga/actions";
import { WeekResult } from "@/components/league/WeekResult";
import { Toast } from "@/components/ui/Toast";
import { stageChanged } from "@/lib/gamification/levels";
import type { BadgeDay } from "@/lib/gamification/present";
import type { ThemeCode, ThemePreference } from "@/lib/gamification/themes";
import type { WeekResult as LeagueResult } from "@/lib/league/queries";
import { FruitReveal } from "./FruitReveal";
import { LevelUpCelebration } from "./LevelUpCelebration";
import { ThemeUnlocked } from "./ThemeUnlocked";
import { registerRewardsQueue } from "./rewardsQueueSignal";

/** Revelações mostradas por vez ao abrir o app (as mais antigas ficam só no álbum). */
const MAX_REVEALS = 7;

/**
 * A pessoa fechou o fruto (X ou Esc) neste carregamento da página: a fila não reabre
 * sozinha ao ser recriada (ex.: revalidação do layout), só no toque no cartão do Início
 * ou ao recarregar o app. Só muda em eventos do navegador.
 */
let deferred = false;

type Step =
  | { kind: "badge"; badge: BadgeDay }
  | { kind: "theme"; code: ThemeCode }
  | { kind: "level"; from: number; to: number }
  | { kind: "league"; result: LeagueResult };

/**
 * Fila de recompensas ao abrir o app (DECISOES 10/11): primeiro os frutos (tela 12,
 * do mais antigo ao mais novo), depois o tema desbloqueado (14), depois o nível (13
 * ou toast) e, por último, o resultado da semana da Feira (25). Tudo foi calculado no
 * servidor; aqui só se mostra e marca como visto. A coorte B recebe só o resultado da
 * Feira (as listas de recompensa chegam vazias).
 * Fica de fora do pomodoro, que mostra o próprio nível depois do fim do ciclo.
 *
 * Quando abre (telas.md › 12, revisão de 16/11): a decisão é tomada ao montar, pela
 * tela em que a pessoa está — no primeiro carregamento do app ou quando chega uma
 * pendência nova (a chave do layout muda). No pomodoro ela nasce fechada, e navegar
 * (inclusive sair do pomodoro) não a abre: espera a próxima abertura do app ou o toque
 * no cartão "Fruto de ontem" do Início.
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
  leagueResult = null,
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
  theme: ThemePreference;
  /** Resultado da semana ainda não visto (tela 25). */
  leagueResult?: LeagueResult | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sceneTheme = useEffectiveTheme(theme);
  const [steps, setSteps] = useState<Step[]>(() => [
    ...badges.slice(-MAX_REVEALS).map((badge): Step => ({ kind: "badge", badge })),
    ...themes.map((code): Step => ({ kind: "theme", code })),
    ...(levelTo > levelFrom ? [{ kind: "level", from: levelFrom, to: levelTo } as Step] : []),
    ...(leagueResult ? [{ kind: "league", result: leagueResult } as Step] : []),
  ]);
  const [open, setOpen] = useState(() => !pathname.startsWith("/pomodoro") && !deferred);
  const [busy, startTransition] = useTransition();

  const current = steps[0];
  const advance = useCallback(() => setSteps((s) => s.slice(1)), []);
  const hasFruit = steps.some((s) => s.kind === "badge");

  // Toque no cartão do Início: reabre a fila adiada (só se ainda houver fruto nela).
  useEffect(
    () =>
      registerRewardsQueue(() => {
        if (!hasFruit) return false;
        deferred = false;
        setOpen(true);
        return true;
      }),
    [hasFruit],
  );

  if (!open || pathname.startsWith("/pomodoro")) return null;

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
            const last = !steps.slice(1).some((s) => s.kind === "badge");
            advance();
            if (!last) {
              void markBadgesSeen([current.badge.day]);
              return;
            }
            // Último fruto: o cartão do Início deixa de mostrar "Toque para colher".
            startTransition(async () => {
              await markBadgesSeen(badges.map((b) => b.day));
              router.refresh();
            });
          }}
          onClose={() => {
            // Adia a fila inteira sem marcar nada como visto.
            deferred = true;
            setOpen(false);
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
      {current?.kind === "league" && (
        <WeekResult
          result={current.result}
          theme={sceneTheme}
          onSee={() => {
            void markWeekResultSeen(current.result.week);
            advance();
            router.push("/liga");
          }}
          onClose={() => {
            void markWeekResultSeen(current.result.week);
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
