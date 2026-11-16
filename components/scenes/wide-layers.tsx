/**
 * Cena larga do pomodoro no computador, uma composição por tema (telas.md › Pomodoro no
 * computador; docs/design/cenas/pomodoro-desktop-*.html). Até 5 camadas animadas,
 * marcadas com `data-camada` (o e2e confere a contagem); só transform/opacity.
 *
 * A árvore do tema fica no terço direito, em (990, 572), no estágio do nível (como no
 * celular, decisão da dupla 13/11). O fruto do ciclo é o da árvore e amadurece com o
 * progresso real do foco.
 */

import type { Stage } from "@/lib/gamification/levels";
import { FRUIT_ANCHOR, OrchardTree } from "./OrchardTree";
import {
  Bat,
  ChristmasPine,
  CycleFruit,
  DryBackTree,
  DryTree,
  Snowman,
  STAGE_SCALE,
} from "./layers";
import {
  BackPine,
  BackTree,
  Butterfly,
  c,
  Holly,
  Moon,
  PetalFlower,
  Poinsettia,
  Pumpkin,
  Sky,
  SmallTulip,
  Tulip,
  Twig,
} from "./parts";
import s from "./Scene.module.css";
import {
  FLOWER_SPOTS,
  LANDSCAPE_SHIFT,
  snowBlock,
  WIDE_H,
  WideBushes,
  WideClouds,
  WideField,
  WideFlowers,
  WideFrontMeadow,
  WideFrontShrubs,
  WideGrove,
  WideMeadow,
  WideMountains,
  type Dot,
} from "./wide";

export type WideLayerProps = {
  stage: Stage;
  /** 0–1: o fruto do ciclo amadurece. */
  progress: number;
  harvested: boolean;
  /** Prefixo dos ids de degradê. */
  uid: string;
};

/** Onde fica a base da árvore do tema na cena larga. */
const TREE = { x: 990, y: 572 };

/** Árvore com folhas (Clássico e Noturno) no estágio do nível, com o fruto do ciclo. */
function WideOrchard({ stage, progress, harvested }: WideLayerProps) {
  const a = FRUIT_ANCHOR[stage];
  return (
    <g transform={`translate(${TREE.x} ${TREE.y}) scale(2.1)`}>
      <g className={s.sway}>
        <OrchardTree
          stage={stage}
          fruit={<CycleFruit r={a.r} progress={progress} harvested={harvested} />}
        />
      </g>
    </g>
  );
}

function BigBackTree() {
  return (
    <>
      <ellipse cx="0" cy="0" rx="16" ry="3" fill={c("tree-shadow")} />
      <BackTree />
    </>
  );
}

// Clássico ----------------------------------------------------------------------

export function WideClassico(p: WideLayerProps) {
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      <g data-camada="nuvens">
        <WideClouds />
      </g>
      <g transform={`translate(0 ${LANDSCAPE_SHIFT})`}>
        <WideMountains />
        <WideField />
        <g data-camada="vegetacao">
          <WideGrove big={<BigBackTree />} small={<BackTree light={false} full={false} />} sway />
          <WideBushes />
          <WideMeadow />
          <WideOrchard {...p} />
        </g>
        <g data-camada="borboletas">
          <g className={s.flyA}>
            <g transform="translate(880 470)">
              <Butterfly />
            </g>
          </g>
          <g className={s.flyB}>
            <g transform="translate(1140 520)">
              <Butterfly small />
            </g>
          </g>
          <g className={s.flyA} style={{ animationDuration: "17s", animationDelay: "-6s" }}>
            <g transform="translate(300 540)">
              <Butterfly small />
            </g>
          </g>
        </g>
        <g data-camada="flores">
          <WideFlowers
            spots={FLOWER_SPOTS.classico}
            pieces={{
              tulipa: <Tulip />,
              margarida: <PetalFlower veins />,
              botao: <SmallTulip />,
              ramo: <Twig />,
            }}
          />
        </g>
        <WideFrontShrubs />
        <WideFrontMeadow />
      </g>
    </>
  );
}

// Noturno -----------------------------------------------------------------------

/** Estrelas da referência: as 20 primeiras piscam (≤ 20 partículas), as outras ficam paradas. */
const STARS: [number, number, number][] = [
  [673, 87, 2],
  [158, 284, 1],
  [898, 224, 1],
  [1138, 227, 1],
  [263, 124, 1],
  [822, 35, 1.2],
  [282, 158, 2],
  [380, 62, 1.2],
  [1131, 374, 1],
  [1277, 115, 2],
  [885, 170, 2],
  [378, 367, 1.2],
  [624, 278, 2],
  [866, 94, 1.5],
  [1011, 225, 1],
  [727, 314, 2],
  [944, 45, 1],
  [980, 366, 1],
  [1216, 103, 1.5],
  [147, 116, 2],
  // paradas
  [128, 269, 1.2],
  [251, 302, 1.5],
  [938, 195, 1.5],
  [929, 157, 1],
  [168, 295, 1.5],
  [644, 341, 2],
  [800, 352, 1.5],
  [955, 191, 1.2],
  [1021, 40, 1.2],
  [274, 136, 2],
  [1135, 152, 1.2],
  [789, 128, 1.2],
  [319, 128, 1.2],
  [308, 224, 1.5],
  [662, 74, 1],
  [1155, 210, 2],
  [222, 256, 2],
  [706, 317, 1],
  [1170, 87, 1],
  [1266, 23, 1],
  [1267, 202, 1.2],
  [246, 259, 2],
  [648, 53, 1.2],
];
const TWINKLING = 20;

const FIREFLIES: [number, number][] = [
  [860, 440],
  [1120, 500],
  [300, 520],
  [640, 560],
  [1240, 450],
  [450, 600],
  [780, 520],
  [180, 470],
];

export function WideNoturno(p: WideLayerProps) {
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      <g fill={c("star")}>
        <g data-camada="estrelas">
          {STARS.slice(0, TWINKLING).map(([cx, cy, r], i) => (
            <circle
              key={`${cx}-${cy}`}
              className={s.twinkle}
              cx={cx}
              cy={cy}
              r={r}
              style={{ animationDelay: `${-((i * 0.37) % 4).toFixed(2)}s` }}
            />
          ))}
        </g>
        <g opacity="0.7">
          {STARS.slice(TWINKLING).map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </g>
      <Moon id={`${p.uid}-lua`} cx={760} cy={190} r={62} glow={170} />
      <g data-camada="nuvens">
        <WideClouds middle={false} />
      </g>
      <g transform={`translate(0 ${LANDSCAPE_SHIFT})`}>
        <WideMountains caps="glint" />
        <WideField />
        <WideGrove big={<BigBackTree />} small={<BackTree light={false} full={false} />} />
        <WideMeadow />
        <g data-camada="vegetacao">
          <WideOrchard {...p} />
        </g>
        <g data-camada="flores">
          <WideFlowers
            spots={FLOWER_SPOTS.noturno}
            pieces={{
              tulipa: <Tulip wide={false} />,
              margarida: <PetalFlower />,
              botao: <SmallTulip />,
            }}
          />
        </g>
        <WideFrontShrubs />
        <WideFrontMeadow />
        <g data-camada="vagalumes">
          {FIREFLIES.map(([x, y], i) => (
            <g
              key={x}
              className={i % 2 ? s.firefly2 : s.firefly}
              style={{ animationDelay: `${-(i * 0.9).toFixed(1)}s` }}
            >
              <g transform={`translate(${x} ${y})`}>
                <circle r="7" fill={c("critter-glow")} opacity="0.3" />
                <circle
                  r="2.4"
                  fill={c("critter")}
                  className={s.twinkle}
                  style={{ animationDelay: `${-(i * 0.4).toFixed(1)}s` }}
                />
              </g>
            </g>
          ))}
        </g>
      </g>
    </>
  );
}

// Halloween ---------------------------------------------------------------------

const HW_DOTS: [number, number, number][] = [
  [120, 60, 1.4],
  [300, 120, 1.2],
  [620, 50, 1.5],
  [980, 90, 1.2],
  [1180, 40, 1.6],
  [1300, 150, 1.2],
  [880, 210, 1.1],
  [460, 200, 1.2],
];

/** Abóbora com a base em (0, 0); `face` acende como lanterna (camada do brilho). */
function GroundPumpkin({ face = false }: { face?: boolean }) {
  return (
    <g transform="translate(0 -12)">
      <Pumpkin rx={16} ry={12} face={face} />
    </g>
  );
}

export function WideHalloween(p: WideLayerProps) {
  const k = STAGE_SCALE[p.stage];
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      <g fill={c("sky-dot")} opacity="0.7">
        {HW_DOTS.map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <Moon id={`${p.uid}-lua`} cx={760} cy={200} r={78} glow={190} />
      <g data-camada="morcegos">
        <g className={s.batWideA}>
          <g transform="translate(560 150)">
            <Bat y={0} scale={1.6} />
          </g>
        </g>
        <g className={s.batWideA2}>
          <g transform="translate(600 250)">
            <Bat y={0} scale={1.1} delay={-0.1} />
          </g>
        </g>
        <g className={s.batWideB}>
          <g transform="translate(700 120)">
            <Bat y={0} scale={1.3} delay={-0.2} />
          </g>
        </g>
      </g>
      <g transform={`translate(0 ${LANDSCAPE_SHIFT})`}>
        <WideMountains />
        <WideField />
        <WideGrove big={<DryBackTree />} small={<DryBackTree />} />
        <WideMeadow />
        <g data-camada="nevoa">
          <g className={s.fog} fill={c("fog")} opacity="0.13">
            <ellipse cx="200" cy="500" rx="260" ry="22" />
            <ellipse cx="760" cy="512" rx="300" ry="20" />
            <ellipse cx="1240" cy="498" rx="220" ry="20" />
          </g>
        </g>
        <g data-camada="brilho">
          <g transform={`translate(${TREE.x} ${TREE.y}) scale(${2.4 * k})`}>
            <DryTree />
          </g>
          <g transform="translate(940 584) scale(1.5)">
            <GroundPumpkin face />
          </g>
          <g transform="translate(1060 590) scale(1.2)">
            <GroundPumpkin />
          </g>
        </g>
        <g data-camada="fruto" transform="translate(1010 600) scale(1.7) translate(0 -12)">
          <CycleFruit r={12} progress={p.progress} harvested={p.harvested} shape="pumpkin" />
        </g>
        <g data-camada="flores">
          <WideFlowers
            spots={FLOWER_SPOTS.halloween}
            pieces={{ flor: <Tulip wide={false} />, botao: <SmallTulip /> }}
          />
        </g>
        <g data-camada="brilho">
          <g transform="translate(150 664) scale(1.1)">
            <GroundPumpkin face />
          </g>
          <g transform="translate(520 670)">
            <GroundPumpkin />
          </g>
          <g transform="translate(1230 668) scale(1.1)">
            <GroundPumpkin face />
          </g>
        </g>
        <WideFrontShrubs />
        <WideFrontMeadow />
        <g data-camada="nevoa">
          <g className={s.fog2} fill={c("fog")} opacity="0.16">
            <ellipse cx="320" cy="628" rx="300" ry="14" />
            <ellipse cx="1000" cy="620" rx="340" ry="12" />
          </g>
        </g>
      </g>
    </>
  );
}

// Natal -------------------------------------------------------------------------

/** Dois blocos de neve (decisão da dupla 13/11: cada bloco conta como 1 elemento animado). */
const SNOW_A = snowBlock(70, 1.6, 3, 11);
const SNOW_B = snowBlock(30, 2.6, 3.4, 29);

/** Bloco desenhado duas vezes (em cima e acima de si mesmo) para o loop não ter emenda. */
function SnowLayer({
  dots,
  className,
  opacity,
}: {
  dots: Dot[];
  className: string | undefined;
  opacity: number;
}) {
  return (
    <g fill={c("critter")} opacity={opacity} className={className}>
      {[0, -WIDE_H].map((dy) =>
        dots.map(([cx, cy, r]) => <circle key={`${dy}-${cx}-${cy}`} cx={cx} cy={cy + dy} r={r} />),
      )}
    </g>
  );
}

export function WideNatal(p: WideLayerProps) {
  const k = STAGE_SCALE[p.stage];
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      <g data-camada="nuvens">
        <WideClouds small={false} middle={false} />
      </g>
      <g transform={`translate(0 ${LANDSCAPE_SHIFT})`}>
        <WideMountains caps="snow" />
        <WideField />
        <WideGrove big={<BackPine />} small={<BackPine light={false} caps={1} />} />
        <WideMeadow />
        <g data-camada="estrela" transform={`translate(${TREE.x} ${TREE.y}) scale(${1.15 * k})`}>
          <ChristmasPine progress={p.progress} harvested={p.harvested} star />
        </g>
        <g transform="translate(1170 592) scale(1.4)">
          <Snowman />
        </g>
        <g data-camada="flores">
          <WideFlowers
            spots={FLOWER_SPOTS.natal}
            pieces={{ flor: <Poinsettia />, azevinho: <Holly /> }}
          />
        </g>
        <WideFrontShrubs snow />
        <WideFrontMeadow />
      </g>
      <g data-camada="neve">
        <SnowLayer dots={SNOW_A} className={s.snowWide} opacity={0.85} />
        <SnowLayer dots={SNOW_B} className={s.snowWide2} opacity={0.95} />
      </g>
    </>
  );
}
