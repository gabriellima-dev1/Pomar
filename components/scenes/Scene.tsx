"use client";

import { useEffect, useId, useState } from "react";
import type { Stage } from "@/lib/gamification/levels";
import type { ThemeCode } from "@/lib/gamification/themes";
import { THEMES } from "@/themes";
import {
  ClassicoLayers,
  HalloweenLayers,
  NatalLayers,
  NoturnoLayers,
  type LayerProps,
} from "./layers";
import s from "./Scene.module.css";

const LAYERS: Record<ThemeCode, (p: LayerProps) => React.ReactNode> = {
  classico: ClassicoLayers,
  noturno: NoturnoLayers,
  halloween: HalloweenLayers,
  natal: NatalLayers,
};

/**
 * Cena do pomodoro "Campo e montanhas" de um tema (SVG inline, CSS só em
 * transform/opacity). A árvore do pomar acompanha o estágio do nível e o fruto do
 * tema amadurece com o progresso do foco. Pausa as animações com a aba oculta;
 * `prefers-reduced-motion` desliga tudo (Scene.module.css).
 *
 * As cores vêm dos tokens `--scene-*` do `data-theme` mais próximo: quem usa a
 * cena define o tema num elemento acima (ou no `<html>`).
 */
export function Scene({
  theme,
  stage = "adulta",
  progress = 0,
  harvested = false,
  still = false,
  orchard = true,
  withTimer = false,
  viewBox = "0 0 390 844",
  preserveAspectRatio = "xMidYMax meet",
  className = "absolute inset-0 h-full w-full",
}: {
  theme: ThemeCode;
  stage?: Stage;
  /** Progresso do foco (0–1): amadurece o fruto do ciclo. */
  progress?: number;
  /** Fim do foco: o fruto é colhido. */
  harvested?: boolean;
  /** Sem animação (miniaturas, prévia estática). */
  still?: boolean;
  /** Desenhar a árvore do pomar. */
  orchard?: boolean;
  /**
   * A tela tem o cronômetro de vidro: nos temas em que ele "mora" na lua ou na estrela
   * (§6.7), o astro sai da cena e o GlassTimer desenha atrás do painel.
   */
  withTimer?: boolean;
  viewBox?: string;
  preserveAspectRatio?: string;
  className?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");

  useEffect(() => {
    if (still) return;
    const update = () => setHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [still]);

  const Layers = LAYERS[theme];
  const layout = THEMES[theme].layout;
  const p = Math.max(0, Math.min(1, progress));
  const layers = (
    <Layers
      layout={layout}
      stage={stage}
      progress={p}
      harvested={harvested}
      orchard={orchard}
      celestial={!(withTimer && layout.timer !== "plain")}
      uid={`cena${uid}`}
    />
  );

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      className={`${className} ${still ? s.still : hidden ? s.hidden : ""}`}
      aria-hidden
    >
      {/* Paisagem espelhada = árvore à esquerda (Noturno, §6.7). */}
      {layout.mirror ? <g transform="translate(390 0) scale(-1 1)">{layers}</g> : layers}
    </svg>
  );
}

/** Miniatura da cena de um tema (aba Temas, 160×112), com os tokens daquele tema. */
export function SceneThumb({
  theme,
  stage = "adulta",
  className = "",
}: {
  theme: ThemeCode;
  stage?: Stage;
  className?: string;
}) {
  return (
    <div
      data-theme={theme}
      className={`relative aspect-[160/112] w-full overflow-hidden rounded-md bg-[var(--scene-sky-bottom)] ${className}`}
    >
      <Scene
        theme={theme}
        stage={stage}
        progress={1}
        still
        viewBox="0 250 390 330"
        preserveAspectRatio="xMidYMid slice"
      />
    </div>
  );
}
