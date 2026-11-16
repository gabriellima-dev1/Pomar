"use client";

import { useEffect, useId, useState } from "react";
import type { Stage } from "@/lib/gamification/levels";
import type { ThemeCode } from "@/lib/gamification/themes";
import s from "./Scene.module.css";
import { WIDE_H, WIDE_W } from "./wide";
import {
  WideClassico,
  WideHalloween,
  WideNatal,
  WideNoturno,
  type WideLayerProps,
} from "./wide-layers";

const LAYERS: Record<ThemeCode, (p: WideLayerProps) => React.ReactNode> = {
  classico: WideClassico,
  noturno: WideNoturno,
  halloween: WideHalloween,
  natal: WideNatal,
};

/**
 * Cena larga do pomodoro no computador (≥ 1024px): uma paisagem só, em
 * `viewBox 0 0 1350 844` com `slice` (cobre a tela em qualquer proporção, corta as
 * bordas). Substitui, no pomodoro, as cópias espelhadas da cena de celular.
 * Pausa as animações com a aba oculta; `prefers-reduced-motion` desliga tudo
 * (Scene.module.css). As cores vêm do `data-theme` mais próximo.
 */
export function WideScene({
  theme,
  stage = "adulta",
  progress = 0,
  harvested = false,
  className = "absolute inset-0 h-full w-full",
}: {
  theme: ThemeCode;
  stage?: Stage;
  /** Progresso do foco (0–1): amadurece o fruto do ciclo. */
  progress?: number;
  /** Fim do foco: o fruto é colhido. */
  harvested?: boolean;
  className?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");

  useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const Layers = LAYERS[theme];
  return (
    <svg
      viewBox={`0 0 ${WIDE_W} ${WIDE_H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`${className} ${hidden ? s.hidden : ""}`}
      data-cena-larga={theme}
      aria-hidden
    >
      <Layers
        stage={stage}
        progress={Math.max(0, Math.min(1, progress))}
        harvested={harvested}
        uid={`larga${uid}`}
      />
    </svg>
  );
}
