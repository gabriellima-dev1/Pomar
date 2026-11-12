"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Stage } from "@/lib/gamification/levels";
import type { ThemeCode } from "@/lib/gamification/themes";
import {
  panoramaWidth,
  SCENE_H,
  SCENE_W,
  sidePanelCount,
  sidePanelTransform,
} from "@/lib/design/panorama";
import { THEMES } from "@/themes";
import {
  ClassicoLayers,
  HalloweenLayers,
  NatalLayers,
  NoturnoLayers,
  type LayerProps,
} from "./layers";
import s from "./Scene.module.css";

const DEFAULT_VIEWBOX = `0 0 ${SCENE_W} ${SCENE_H}`;
const DEFAULT_ASPECT = "xMidYMax meet";

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
  viewBox = DEFAULT_VIEWBOX,
  preserveAspectRatio = DEFAULT_ASPECT,
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
  const ref = useRef<SVGSVGElement>(null);
  // Só o enquadramento padrão (tela cheia) se estende para os lados.
  const panoramic = viewBox === DEFAULT_VIEWBOX && preserveAspectRatio === DEFAULT_ASPECT;
  const [width, setWidth] = useState(SCENE_W);

  useEffect(() => {
    const el = ref.current;
    if (!panoramic || !el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(panoramaWidth(entry.contentRect.width, entry.contentRect.height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [panoramic]);

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

  // Painéis laterais: paisagem parada, sem árvore do pomar e sem lua/estrela, para a
  // cena continuar com no máximo 5 camadas animadas e 20 partículas (§6.7).
  const sides = panoramic ? sidePanelCount(width) : 0;
  const panels = Array.from({ length: sides }, (_, i) => [i + 1, -(i + 1)]).flat();
  const shownViewBox =
    panoramic && width > SCENE_W ? `${-(width - SCENE_W) / 2} 0 ${width} ${SCENE_H}` : viewBox;

  return (
    <svg
      ref={ref}
      viewBox={shownViewBox}
      preserveAspectRatio={preserveAspectRatio}
      className={`${className} ${still ? s.still : hidden ? s.hidden : ""}`}
      aria-hidden
    >
      {/* Paisagem espelhada = árvore à esquerda (Noturno, §6.7). */}
      {layout.mirror ? <g transform="translate(390 0) scale(-1 1)">{layers}</g> : layers}
      {/* Painéis por cima da central (o céu e o campo dela se estendem), do mais distante
          para o mais próximo. Cada um fica recortado na própria faixa de 390 e avança 1
          unidade para dentro, por baixo do vizinho mais próximo do centro: a emenda não
          deixa pixel vazio. Máscara (e não clipPath): ela recorta o painel já montado; o
          clipPath recortava camada por camada e a emenda virava um traço claro. */}
      {panels.length > 0 && (
        <defs>
          {panels.map((k) => {
            const n = Math.abs(k);
            const x = k > 0 ? SCENE_W * n - 1 : -SCENE_W * n;
            return (
              <mask
                key={k}
                id={`cena${uid}-painel${k}`}
                maskUnits="userSpaceOnUse"
                x={x}
                y="0"
                width={SCENE_W + 1}
                height={SCENE_H}
              >
                <rect x={x} y="0" width={SCENE_W + 1} height={SCENE_H} fill="white" />
              </mask>
            );
          })}
        </defs>
      )}
      {[...panels].reverse().map((k) => (
        <g key={k} mask={`url(#cena${uid}-painel${k})`} className={s.still}>
          <g transform={sidePanelTransform(k)}>
            <g transform={layout.mirror ? "translate(390 0) scale(-1 1)" : undefined}>
              <Layers
                layout={layout}
                stage={stage}
                progress={0}
                harvested={false}
                orchard={false}
                celestial={false}
                uid={`cena${uid}p${k < 0 ? "e" : "d"}${Math.abs(k)}`}
              />
            </g>
          </g>
        </g>
      ))}
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
