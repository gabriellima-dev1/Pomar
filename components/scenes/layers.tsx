/**
 * Composição de cada tema a partir das partes comuns (docs/design/cenas/scene-*.html).
 * Cada tema tem no máximo 5 camadas animadas (ver Scene.module.css).
 */

import type { Stage } from "@/lib/gamification/levels";
import type { ThemeConfig } from "@/themes";
import { FRUIT_ANCHOR, OrchardTree } from "./OrchardTree";
import {
  BackPine,
  BackTree,
  c,
  Clouds,
  Field,
  FrontShrubs,
  Meadow,
  Moon,
  Mountains,
  PetalFlower,
  Poinsettia,
  Pumpkin,
  Sky,
  SmallTulip,
  Tulip,
} from "./parts";
import s from "./Scene.module.css";

export type LayerProps = {
  layout: ThemeConfig["layout"];
  stage: Stage;
  /** 0–1: o fruto do ciclo amadurece. */
  progress: number;
  harvested: boolean;
  /** Desenhar a árvore do pomar (a celebração de nível desenha a sua por cima). */
  orchard: boolean;
  /** Desenhar a lua (ou a estrela do pinheiro) na cena; não quando o cronômetro a desenha. */
  celestial: boolean;
  /** Prefixo dos ids de degradê (várias cenas na mesma página). */
  uid: string;
};

/** Escala da árvore temática (seca no Halloween, pinheiro no Natal) por estágio. */
const STAGE_SCALE: Record<Stage, number> = {
  muda: 0.5,
  arbusto: 0.65,
  jovem: 0.82,
  adulta: 1,
  frondosa: 1.1,
};

/** Fruto deste ciclo: verde → maduro (opacidade = progresso, escala 0,6 → 1) → colhido. */
function CycleFruit({
  r,
  progress,
  harvested,
  shape = "round",
}: {
  r: number;
  progress: number;
  harvested: boolean;
  shape?: "round" | "pumpkin";
}) {
  const style = {
    opacity: harvested ? 1 : progress,
    transform: `scale(${0.6 + 0.4 * progress})`,
  };
  if (shape === "pumpkin") {
    const rx = r * 1.33;
    return (
      <g className={harvested ? s.harvest : undefined}>
        <ellipse rx={rx} ry={r} fill="var(--fruit-unripe)" />
        <ellipse rx={rx} ry={r} fill={c("fruit-ripe")} className={s.fruit} style={style} />
        <path
          d={`M0 -${r} C-${rx * 0.45} -${r * 0.45} -${rx * 0.45} ${r * 0.45} 0 ${r} M0 -${r} C${rx * 0.45} -${r * 0.45} ${rx * 0.45} ${r * 0.45} 0 ${r}`}
          fill="none"
          stroke={c("pumpkin-line")}
          strokeWidth="1.6"
          opacity="0.5"
        />
        <ellipse
          cx={-rx / 2}
          cy={-r / 2.5}
          rx="4"
          ry="2.4"
          fill="var(--illo-shine)"
          opacity="0.4"
          transform={`rotate(-25 ${-rx / 2} ${-r / 2.5})`}
        />
        <path
          d={`M0 -${r} q2 -7 7 -8 M7 -${r + 8} q8 -2 10 4`}
          stroke={c("leaf")}
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  }
  return (
    <g className={harvested ? s.harvest : undefined}>
      <circle r={r} fill="var(--fruit-unripe)" />
      <circle r={r} fill={c("fruit-ripe")} className={s.fruit} style={style} />
      <ellipse
        cx={-r * 0.32}
        cy={-r * 0.32}
        rx={r * 0.28}
        ry={r * 0.18}
        fill="var(--illo-shine)"
        opacity="0.7"
      />
    </g>
  );
}

/** Árvore do pomar com folhas (Clássico e Noturno), no estágio do nível. */
function LeafyOrchard({ layout, stage, progress, harvested }: LayerProps) {
  const a = FRUIT_ANCHOR[stage];
  return (
    <g transform={`translate(${layout.treeX} ${layout.treeBaseY}) scale(${layout.treeScale})`}>
      <g className={s.sway}>
        <OrchardTree
          stage={stage}
          fruit={<CycleFruit r={a.r} progress={progress} harvested={harvested} />}
        />
      </g>
    </g>
  );
}

// Clássico ----------------------------------------------------------------------

export function ClassicoLayers(p: LayerProps) {
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      {/* 1 · nuvens */}
      <Clouds />
      <Mountains />
      <Field />
      {/* 2 · vegetação ao fundo */}
      <g transform="translate(32 528) scale(0.9)">
        <g className={s.swayB}>
          <ellipse cx="0" cy="0" rx="16" ry="3" fill={c("tree-shadow")} />
          <BackTree />
        </g>
      </g>
      <g transform="translate(110 508) scale(0.7)">
        <g className={s.swayC}>
          <BackTree />
        </g>
      </g>
      <g transform="translate(160 490) scale(0.38)">
        <BackTree light={false} full={false} />
      </g>
      <g transform="translate(184 492) scale(0.34)">
        <BackTree light={false} full={false} />
      </g>
      <g transform="translate(214 498) scale(0.5)">
        <BackTree full={false} />
      </g>
      <path d="M60 540 q10 -14 22 -8 q10 -10 22 -2 q8 -2 10 10 h-54z" fill={c("canopy-dark")} />
      <path d="M190 516 q8 -10 18 -6 q8 -8 18 -1 q6 -1 8 7 h-44z" fill={c("canopy-dark")} />
      <Meadow />
      {/* 4 · árvore do pomar e o fruto do ciclo */}
      {p.orchard && <LeafyOrchard {...p} />}
      {/* 3 · borboletas */}
      <g className={s.flyA}>
        <g transform="translate(120 470)">
          <g className={s.wing}>
            <path
              d="M0 0 C-8 -10 -14 -6 -12 0 C-14 6 -8 8 0 0 C8 8 14 6 12 0 C14 -6 8 -10 0 0Z"
              fill={c("butterfly")}
            />
          </g>
          <path d="M0 -4 V4" stroke={c("butterfly-body")} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <g className={s.flyB}>
        <g transform="translate(250 520)">
          <g className={`${s.wing} ${s.wingB}`}>
            <path
              d="M0 0 C-7 -9 -12 -5 -10 0 C-12 5 -7 7 0 0 C7 7 12 5 10 0 C12 -5 7 -9 0 0Z"
              fill={c("flower-yellow")}
            />
          </g>
          <path d="M0 -3 V3" stroke={c("butterfly-body")} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      {/* 2 · flores da frente */}
      <g transform="translate(46 640)">
        <g className={s.bob}>
          <Tulip />
        </g>
      </g>
      <g transform="translate(116 650)">
        <g className={s.bobB}>
          <PetalFlower veins />
        </g>
      </g>
      <g transform="translate(196 646)">
        <g className={s.bobC}>
          <SmallTulip />
        </g>
      </g>
      <g transform="translate(300 652)">
        <g className={s.bob}>
          <PetalFlower height={58} />
        </g>
      </g>
      <g transform="translate(356 646)">
        <g className={s.bobB}>
          <g transform="translate(0 6)">
            <Tulip />
          </g>
        </g>
      </g>
      <g transform="translate(250 650)">
        <g className={s.bobC}>
          <path
            d="M0 0 C-4 -16 -10 -26 -20 -34 M-8 -18 l-10 -4 M-14 -26 l-10 -2 M-6 -12 l4 -10 M-12 -22 l4 -10"
            fill="none"
            stroke={c("flower-coral")}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </g>
      <FrontShrubs />
    </>
  );
}

// Noturno -----------------------------------------------------------------------

const STARS: [number, number, number, number][] = [
  [30, 40, 1.6, 0],
  [90, 70, 1.2, -1],
  [350, 50, 1.8, -2],
  [300, 120, 1.2, -0.5],
  [40, 270, 1.4, -1.6],
  [180, 300, 1.2, -2.4],
  [220, 350, 1.6, -0.8],
  [120, 250, 1, -2.8],
  [370, 380, 1.2, -1.2],
];

const FIREFLIES: [number, number, number, number][][] = [
  [
    [70, 560, 7, 0],
    [150, 520, 6, -0.8],
    [230, 590, 7, -1.6],
  ],
  [
    [260, 500, 6, -0.4],
    [110, 610, 7, -2],
    [350, 580, 6, -1.2],
    [190, 460, 5, -2.6],
  ],
];

export function NoturnoLayers(p: LayerProps) {
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      {/* 2 · estrelas */}
      <g fill={c("star")}>
        {STARS.map(([x, y, r, delay]) => (
          <circle
            key={`${x}-${y}`}
            className={s.twinkle}
            cx={x}
            cy={y}
            r={r}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </g>
      {p.celestial && <Moon id={`${p.uid}-lua`} cx={310} cy={300} r={40} glow={90} />}
      {/* 1 · nuvens escuras (sem a da direita, que cobriria a lua) */}
      <g className={s.drift} fill={c("cloud")}>
        <g opacity="0.85">
          <circle cx="-6" cy="240" r="50" />
          <circle cx="40" cy="282" r="34" />
          <circle cx="4" cy="320" r="38" />
        </g>
        <g opacity="0.8">
          <circle cx="146" cy="390" r="22" />
          <circle cx="174" cy="400" r="18" />
          <circle cx="200" cy="410" r="16" />
          <rect x="128" y="400" width="90" height="22" />
        </g>
        <g opacity="0.75">
          <circle cx="250" cy="352" r="16" />
          <circle cx="272" cy="344" r="20" />
          <circle cx="296" cy="356" r="14" />
          <rect x="236" y="356" width="72" height="16" />
        </g>
      </g>
      <Mountains caps="glint" />
      <Field />
      {/* 3 · vegetação */}
      <g transform="translate(32 528) scale(0.9)">
        <g className={s.swayB}>
          <BackTree />
        </g>
      </g>
      <g transform="translate(110 508) scale(0.7)">
        <BackTree full={false} />
      </g>
      <g transform="translate(160 490) scale(0.38)">
        <BackTree light={false} full={false} />
      </g>
      <g transform="translate(184 492) scale(0.34)">
        <BackTree light={false} full={false} />
      </g>
      <g transform="translate(214 498) scale(0.5)">
        <BackTree light={false} full={false} />
      </g>
      <path d="M60 540 q10 -14 22 -8 q10 -10 22 -2 q8 -2 10 10 h-54z" fill={c("canopy-dark")} />
      <Meadow marks={false} />
      {/* 5 · árvore do pomar e o fruto do ciclo */}
      {p.orchard && <LeafyOrchard {...p} />}
      <g transform="translate(46 640)">
        <g className={s.bob}>
          <Tulip wide={false} />
        </g>
      </g>
      <g transform="translate(118 650)">
        <g className={s.bobB}>
          <PetalFlower />
        </g>
      </g>
      <g transform="translate(300 652)">
        <g className={s.bob}>
          <PetalFlower height={58} />
        </g>
      </g>
      <g transform="translate(356 646)">
        <g className={s.bobB}>
          <g transform="translate(0 6)">
            <Tulip wide={false} />
          </g>
        </g>
      </g>
      {/* 4 · vaga-lumes (7 partículas) */}
      {FIREFLIES.map((group, i) => (
        <g key={i} className={i === 0 ? s.firefly : s.firefly2}>
          {group.map(([x, y, r, delay]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={r} fill={c("critter-glow")} opacity="0.3" />
              <circle
                cx={x}
                cy={y}
                r={r / 2.9}
                fill={c("critter")}
                className={s.twinkle}
                style={{ animationDelay: `${delay}s` }}
              />
            </g>
          ))}
        </g>
      ))}
      <FrontShrubs />
    </>
  );
}

// Halloween ---------------------------------------------------------------------

function Bat({ y, scale = 1, delay = 0 }: { y: number; scale?: number; delay?: number }) {
  return (
    <g transform={`translate(0 ${y}) scale(${scale})`}>
      <g className={s.batWing} style={{ animationDelay: `${delay}s` }}>
        <path
          d="M0 0 C-6 -8 -14 -8 -20 -2 C-14 -2 -12 2 -12 4 C-8 2 -4 2 0 4 C4 2 8 2 12 4 C12 2 14 -2 20 -2 C14 -8 6 -8 0 0Z"
          fill={c("critter")}
        />
      </g>
      <ellipse cx="0" cy="2" rx="3" ry="4" fill={c("critter")} />
    </g>
  );
}

export function HalloweenLayers(p: LayerProps) {
  const k = STAGE_SCALE[p.stage];
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      {p.celestial && <Moon id={`${p.uid}-lua`} cx={290} cy={320} r={52} glow={110} />}
      {/* 1 · morcegos (o transform em linha é a posição parada, sem animação) */}
      <g className={s.batA} style={{ transform: "translate(120px, 0)" }}>
        <Bat y={300} />
      </g>
      <g className={s.batB} style={{ transform: "translate(230px, 20px)" }}>
        <Bat y={250} scale={0.8} delay={-0.15} />
      </g>
      <g className={s.batC} style={{ transform: "translate(60px, 0)" }}>
        <Bat y={370} scale={0.6} delay={-0.1} />
      </g>
      <Mountains />
      <Field />
      <g transform="translate(32 528) scale(0.9)">
        <BackTree light={false} />
      </g>
      <g transform="translate(110 508) scale(0.7)">
        <path
          d="M-2 0 L-1 -70 L1 -70 L2 0Z M0 -40 L-16 -58 M0 -50 L14 -66 M0 -62 L-8 -80 M-10 -52 L-18 -56"
          stroke={c("trunk")}
          strokeWidth="4"
          strokeLinecap="round"
          fill={c("trunk")}
        />
      </g>
      <g transform="translate(170 492) scale(0.4)">
        <BackTree light={false} full={false} />
      </g>
      <g transform="translate(212 498) scale(0.5)">
        <BackTree light={false} full={false} />
      </g>
      <Meadow marks={false} />
      {/* Árvore seca em silhueta, no estágio do nível */}
      {p.orchard && (
        <g transform={`translate(${p.layout.treeX} ${p.layout.treeBaseY}) scale(${2.1 * k})`}>
          <ellipse cx="0" cy="0" rx="30" ry="4" fill={c("tree-shadow")} />
          <path d="M-5 0 C-4 -30 -3 -60 -1 -86 L1 -86 C3 -60 4 -30 5 0Z" fill={c("trunk")} />
          <path
            d="M0 -40 C-10 -50 -20 -54 -32 -58 M-20 -54 C-24 -60 -26 -66 -26 -72 M0 -52 C10 -62 22 -68 34 -70 M22 -66 C26 -72 30 -76 36 -78 M0 -66 C-6 -76 -10 -84 -16 -92 M0 -74 C6 -84 10 -92 12 -100 M-30 -58 C-34 -56 -36 -52 -36 -48"
            fill="none"
            stroke={c("trunk")}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M34 -70 v8" stroke={c("trunk")} strokeWidth="0.8" />
          {/* 2 · brilho da lanterna e das abóboras */}
          <g className={s.glow}>
            <circle cx="34" cy="-58" r="6" fill={c("critter-glow")} opacity="0.35" />
            <rect x="31.5" y="-61" width="5" height="6" rx="1.5" fill={c("fruit-ripe")} />
          </g>
        </g>
      )}
      <g transform="translate(244 590)">
        <Pumpkin face />
      </g>
      <g transform="translate(356 600) scale(0.8)">
        <Pumpkin />
      </g>
      {/* 5 · a abóbora deste ciclo */}
      {p.orchard && (
        <g transform="translate(300 600)">
          <CycleFruit r={15} progress={p.progress} harvested={p.harvested} shape="pumpkin" />
        </g>
      )}
      {/* 3 · névoa */}
      <g className={s.fog}>
        <ellipse cx="80" cy="572" rx="130" ry="12" fill={c("fog")} opacity="0.28" />
        <ellipse cx="320" cy="548" rx="110" ry="10" fill={c("fog")} opacity="0.24" />
      </g>
      <g className={s.fog2}>
        <ellipse cx="200" cy="610" rx="160" ry="12" fill={c("fog")} opacity="0.2" />
      </g>
      {/* 4 · vegetação */}
      <g transform="translate(46 646)">
        <g className={s.bob}>
          <g transform="translate(0 2) scale(0.95)">
            <Tulip wide={false} />
          </g>
        </g>
      </g>
      <g transform="translate(110 654)">
        <Pumpkin rx={14} ry={10} />
      </g>
      <g transform="translate(200 650)">
        <g className={s.bobB}>
          <path
            d="M0 0 C-4 -16 -10 -26 -18 -34 M0 0 C4 -18 10 -28 18 -36 M0 0 C0 -16 2 -28 0 -40"
            fill="none"
            stroke={c("stem")}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </g>
      <g transform="translate(350 650)">
        <g className={s.bob}>
          <g transform="scale(0.95)">
            <Tulip wide={false} />
          </g>
        </g>
      </g>
      <FrontShrubs />
    </>
  );
}

// Natal -------------------------------------------------------------------------

const FLAKES: [number, number, number, number][] = [
  [20, 2.6, 9, -1],
  [60, 2, 11, -6],
  [96, 3, 8, -3],
  [132, 2.2, 12, -9],
  [168, 2.8, 10, -2],
  [204, 2, 9.5, -7],
  [240, 3, 8.5, -4],
  [276, 2.2, 11.5, -10],
  [312, 2.6, 9, -5],
  [348, 2, 12.5, -8],
  [378, 2.8, 10, -0.5],
  [40, 1.8, 13, -11],
  [150, 1.8, 13.5, -4.5],
  [258, 1.8, 12, -1.5],
  [330, 2.4, 10.5, -6.5],
  [186, 2.4, 11, -12],
];

export function NatalLayers(p: LayerProps) {
  const k = STAGE_SCALE[p.stage];
  const x = p.layout.treeX;
  const y = p.layout.treeBaseY;
  return (
    <>
      <Sky id={`${p.uid}-ceu`} />
      {/* 1 · nuvens */}
      <Clouds />
      <Mountains caps="snow" />
      <Field />
      <g transform="translate(30 530) scale(0.9)">
        <BackPine />
      </g>
      <g transform="translate(100 512) scale(0.7)">
        <BackPine caps={2} />
      </g>
      <g transform="translate(160 494) scale(0.42)">
        <BackPine light={false} caps={1} />
      </g>
      <g transform="translate(186 494) scale(0.36)">
        <BackPine light={false} caps={0} />
      </g>
      <g transform="translate(216 500) scale(0.52)">
        <BackPine caps={1} />
      </g>
      <Meadow />
      {/* Pinheiro do pomar, no estágio do nível */}
      {p.orchard && (
        <g transform={`translate(${x} ${y}) scale(${k}) translate(-300 ${-y})`}>
          <ellipse cx="300" cy="574" rx="72" ry="8" fill={c("tree-shadow")} />
          <rect x="292" y="540" width="16" height="34" rx="3" fill={c("trunk")} />
          <path
            d="M300 344 L340 420 L260 420Z M300 384 L362 476 L238 476Z M300 430 L384 540 L216 540Z"
            fill={c("canopy-dark")}
          />
          <path
            d="M300 344 L340 420 L300 420Z M300 384 L362 476 L300 476Z M300 430 L384 540 L300 540Z"
            fill={c("canopy-light")}
          />
          <g fill={c("snow")}>
            <path d="M260 420 Q270 412 280 420 Q290 412 300 420 Q310 412 320 420 Q330 412 340 420 L336 414 L264 414Z" />
            <path d="M238 476 Q250 466 262 476 Q274 466 286 476 Q298 466 310 476 Q322 466 334 476 Q346 466 362 476 L356 468 L244 468Z" />
            <path d="M216 540 Q230 530 244 540 Q258 530 272 540 Q286 530 300 540 Q314 530 328 540 Q342 530 356 540 Q370 530 384 540 L378 532 L222 532Z" />
            <path d="M300 344 L290 362 L300 358 L310 362Z" />
          </g>
          <path
            d="M272 404 Q300 418 328 402 M254 458 Q300 476 346 456 M234 520 Q300 540 366 518"
            fill="none"
            stroke={c("garland")}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
          <circle cx="284" cy="400" r="6" fill={c("fruit-ripe")} />
          <circle cx="322" cy="452" r="7" fill={c("fruit-ripe")} />
          <circle cx="262" cy="460" r="6" fill={c("ornament-alt")} />
          <circle cx="250" cy="520" r="7" fill={c("fruit-ripe")} />
          <circle cx="350" cy="514" r="7" fill={c("garland")} />
          {/* 5 · o enfeite deste ciclo */}
          <g transform="translate(300 500)">
            <CycleFruit r={8} progress={p.progress} harvested={p.harvested} />
          </g>
          {/* 3 · estrela (com o cronômetro na estrela, ela fica atrás do painel) */}
          {p.celestial && (
            <g className={s.twinkleFast}>
              <path
                d="M300 326 L305 338 L318 339 L308 347 L311 360 L300 353 L289 360 L292 347 L282 339 L295 338Z"
                fill={c("moon")}
              />
            </g>
          )}
        </g>
      )}
      {/* Boneco de neve */}
      <g transform="translate(70 600)">
        <ellipse cx="0" cy="22" rx="24" ry="5" fill={c("snow-shade")} />
        <circle cx="0" cy="6" r="20" fill={c("snow")} />
        <circle cx="0" cy="-22" r="14" fill={c("snow")} />
        <path d="M-14 -12 Q0 -6 14 -12 L14 -6 Q0 0 -14 -6Z" fill={c("fruit-ripe")} />
        <rect x="6" y="-8" width="6" height="16" rx="2" fill={c("fruit-ripe")} />
        <g fill={c("ink")}>
          <circle cx="-5" cy="-25" r="1.8" />
          <circle cx="5" cy="-25" r="1.8" />
          <circle cx="0" cy="2" r="1.8" />
          <circle cx="0" cy="10" r="1.8" />
        </g>
        <path d="M0 -21 l9 2 -9 2z" fill={c("pumpkin")} />
        <path
          d="M-18 0 L-32 -10 M18 0 L32 -12"
          stroke={c("trunk")}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx="-8" cy="-2" rx="5" ry="3" fill={c("snow-shade")} />
      </g>
      {/* 4 · bicos-de-papagaio */}
      <g transform="translate(130 652)">
        <g className={s.bob}>
          <Poinsettia />
        </g>
      </g>
      <g transform="translate(230 656)">
        <g className={s.bobB}>
          <Poinsettia height={40} leaf={false} />
        </g>
      </g>
      <g transform="translate(360 648)">
        <g className={s.bob}>
          <Poinsettia height={52} />
        </g>
      </g>
      {/* 2 · neve (16 flocos) */}
      <g fill={c("critter")}>
        {FLAKES.map(([fx, r, dur, delay]) => (
          <circle
            key={fx}
            className={s.flake}
            cx={fx}
            cy="0"
            r={r}
            style={{
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
              // Posição parada (sem animação): espalhada pelo céu.
              transform: `translateY(${Math.round(((-delay / dur) % 1) * 640)}px)`,
            }}
          />
        ))}
      </g>
      <FrontShrubs snow />
    </>
  );
}
