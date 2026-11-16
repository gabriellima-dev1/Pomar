/**
 * Peças da cena larga do pomodoro no computador (docs/design/cenas/pomodoro-desktop-*.html,
 * viewBox 1350×844). Só o que não existe na cena de celular: a paisagem de 1350 de
 * largura (montanhas, campo, prado, arbustos), as nuvens nas posições largas e as
 * posições das árvores e flores. Árvores, flores, abóboras e bichos são as peças de
 * parts.tsx e layers.tsx, em escala nativa. Cores só de tokens `--scene-*`.
 */

import type { ReactNode } from "react";
import { c } from "./parts";
import s from "./Scene.module.css";

export const WIDE_W = 1350;
export const WIDE_H = 844;
/** A paisagem desce 96 para o horizonte ficar a ~58% da altura. */
export const LANDSCAPE_SHIFT = 96;

// Céu ------------------------------------------------------------------------------

/**
 * Nuvens largas. `small` = a nuvenzinha perto da árvore; `middle` = a do meio, que sai
 * nos temas com lua (ela ficaria na frente).
 */
export function WideClouds({ small = true, middle = true }: { small?: boolean; middle?: boolean }) {
  return (
    <>
      <g className={s.drift}>
        <g transform="translate(530 -150)">
          <g fill={c("cloud-shade")}>
            <circle cx="54" cy="250" r="40" />
            <circle cx="96" cy="276" r="30" />
          </g>
          <g fill={c("cloud")}>
            <circle cx="46" cy="242" r="36" />
            <circle cx="88" cy="270" r="26" />
            <rect x="14" y="262" width="96" height="28" rx="14" />
          </g>
        </g>
        {small && (
          <g fill={c("cloud")}>
            <circle cx="1010" cy="372" r="16" />
            <circle cx="1034" cy="364" r="20" />
            <circle cx="1058" cy="376" r="14" />
            <rect x="996" y="376" width="76" height="18" />
          </g>
        )}
      </g>
      <g className={s.drift2}>
        {middle && (
          <>
            <g fill={c("cloud-shade")}>
              <circle cx="760" cy="212" r="36" />
              <circle cx="804" cy="200" r="44" />
              <circle cx="850" cy="220" r="32" />
            </g>
            <g fill={c("cloud")}>
              <circle cx="756" cy="206" r="32" />
              <circle cx="800" cy="194" r="40" />
              <circle cx="844" cy="214" r="28" />
              <rect x="736" y="214" width="124" height="30" />
            </g>
          </>
        )}
        <g fill={c("cloud-shade")}>
          <circle cx="1286" cy="238" r="46" />
          <circle cx="1330" cy="290" r="48" />
          <circle cx="1250" cy="298" r="30" />
        </g>
        <g fill={c("cloud")}>
          <circle cx="1294" cy="230" r="40" />
          <circle cx="1336" cy="282" r="42" />
          <circle cx="1258" cy="292" r="26" />
          <rect x="1250" y="292" width="100" height="36" />
        </g>
      </g>
    </>
  );
}

// Paisagem (coordenadas dentro do grupo deslocado por LANDSCAPE_SHIFT) ---------------

const PEAKS: [number, number][] = [
  [110, 322],
  [370, 378],
  [690, 300],
  [990, 384],
  [1240, 334],
];

/** 5 montanhas facetadas; `glint` (Noturno) ou `snow` (Natal) nos picos. */
export function WideMountains({ caps }: { caps?: "glint" | "snow" }) {
  return (
    <>
      <path d="M-60 480 L110 322 L290 480Z" fill={c("mountain-light")} />
      <path
        d="M-60 480 L110 322 L98 352 L126 368 L52 410 L168 420 L214 480Z"
        fill={c("mountain-dark")}
      />
      <path d="M200 490 L370 378 L540 490Z" fill={c("mountain-light")} />
      <path
        d="M370 378 L360 400 L402 418 L362 438 L430 448 L460 490 L540 490Z"
        fill={c("mountain-dark")}
      />
      <path d="M470 486 L690 300 L910 486Z" fill={c("mountain-light")} />
      <path
        d="M470 486 L690 300 L676 334 L708 352 L620 400 L752 412 L804 486Z"
        fill={c("mountain-dark")}
      />
      <path d="M820 490 L990 384 L1160 490Z" fill={c("mountain-light")} />
      <path
        d="M990 384 L980 404 L1020 420 L984 438 L1048 448 L1076 490 L1160 490Z"
        fill={c("mountain-dark")}
      />
      <path d="M1060 484 L1240 334 L1420 484Z" fill={c("mountain-light")} />
      <path
        d="M1060 484 L1240 334 L1228 364 L1256 380 L1182 420 L1296 430 L1340 484Z"
        fill={c("mountain-dark")}
      />
      {caps === "glint" && (
        <g fill={c("snowcap")} opacity="0.6">
          {PEAKS.map(([x, y]) => (
            <path
              key={x}
              d={`M${x} ${y} L${x - 18} ${y + 20} L${x - 4} ${y + 14} L${x + 6} ${y + 22} L${x + 16} ${y + 16}Z`}
            />
          ))}
        </g>
      )}
      {caps === "snow" && (
        <g fill={c("snowcap")}>
          <path d="M110 322 L73 356 L92 348 L103 358 L120 349 L134 357 L149 356Z" />
          <path d="M370 378 L318 412 L344 404 L360 414 L383 405 L402 413 L422 412Z" />
          <path d="M690 300 L650 334 L670 326 L682 336 L700 327 L715 335 L730 334Z" />
          <path d="M990 384 L935 418 L963 410 L979 420 L1004 411 L1024 419 L1045 418Z" />
          <path d="M1240 334 L1199 368 L1220 360 L1232 370 L1250 361 L1266 369 L1281 368Z" />
        </g>
      )}
    </>
  );
}

/** Campo ao fundo, atrás dos bosques. */
export function WideField() {
  return (
    <>
      <path d="M0 474 C300 486 700 492 1350 470 V580 H0Z" fill={c("field")} />
      <path
        d="M0 474 C300 486 700 492 1350 470 V480 C700 502 300 496 0 484Z"
        fill={c("field-rim")}
      />
    </>
  );
}

const MEADOW_MARKS: [number, number, number, number][] = [
  [60, 612, 7, 2.4],
  [200, 598, 7, 2.4],
  [380, 624, 7, 2.4],
  [520, 604, 7, 2.4],
  [700, 620, 7, 2.4],
  [820, 600, 7, 2.4],
  [1180, 610, 7, 2.4],
  [1300, 596, 7, 2.4],
  [300, 760, 8, 2.6],
  [640, 780, 8, 2.6],
  [980, 770, 8, 2.6],
  [1220, 790, 8, 2.6],
];

/** Prado com o caminho e os tufos. */
export function WideMeadow() {
  return (
    <>
      <path d="M0 568 C300 558 800 546 1350 532 V844 H0Z" fill={c("meadow")} />
      <path d="M0 568 C300 558 800 546 1350 532 V550 C800 566 300 578 0 586Z" fill={c("path")} />
      <g fill={c("meadow-mark")}>
        {MEADOW_MARKS.map(([cx, cy, rx, ry]) => (
          <ellipse key={cx} cx={cx} cy={cy} rx={rx} ry={ry} />
        ))}
      </g>
    </>
  );
}

/** Faixa do prado mais à frente (por cima dos arbustos). */
export function WideFrontMeadow() {
  return <path d="M0 744 C320 732 900 722 1350 712 V844 H0Z" fill={c("meadow-front")} />;
}

const SHRUBS: [number, number, number][] = [
  [0, 666, 30],
  [40, 676, 28],
  [80, 672, 24],
  [120, 682, 22],
  [170, 684, 20],
  [206, 676, 24],
  [244, 686, 20],
  [296, 682, 24],
  [336, 672, 28],
  [376, 680, 24],
  [420, 686, 20],
  [458, 676, 26],
  [500, 684, 22],
  [546, 678, 26],
  [592, 686, 20],
  [632, 676, 26],
  [676, 684, 22],
  [720, 680, 24],
  [764, 686, 20],
  [806, 676, 26],
  [850, 684, 22],
  [896, 678, 26],
  [940, 686, 20],
  [982, 676, 26],
  [1026, 684, 22],
  [1070, 680, 24],
  [1114, 686, 20],
  [1156, 676, 26],
  [1200, 684, 22],
  [1246, 676, 28],
  [1290, 670, 30],
  [1336, 664, 32],
];

const SHRUB_LIGHTS: [number, number, number][] = [
  [-4, 658, 16],
  [38, 668, 14],
  [204, 668, 12],
  [334, 664, 14],
  [544, 670, 12],
  [804, 668, 13],
  [980, 668, 13],
  [1244, 666, 14],
  [1338, 654, 16],
];

/**
 * Fileira de arbustos da frente. No Natal, os arbustos são verdes (copas) com neve
 * por cima, como na referência 35.
 */
export function WideFrontShrubs({ snow = false }: { snow?: boolean }) {
  return (
    <>
      <g fill={c(snow ? "canopy-dark" : "shrub-dark")}>
        {SHRUBS.map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill={c(snow ? "canopy-light" : "shrub-light")}>
        {SHRUB_LIGHTS.map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      {snow && (
        <g fill={c("snow")}>
          {SHRUBS.map(([cx, cy, r]) => (
            <ellipse key={cx} cx={cx} cy={cy - r + 5} rx={Math.round(r * 0.7)} ry="6" />
          ))}
        </g>
      )}
    </>
  );
}

// Bosques ----------------------------------------------------------------------------

/** Árvores grandes do fundo: x, y, escala e se balançam (classe B ou C). */
const GROVE_BIG: [number, number, number, "b" | "c"][] = [
  [40, 528, 0.9, "b"],
  [118, 508, 0.7, "c"],
  [600, 506, 0.5, "c"],
  [1200, 508, 0.66, "b"],
  [1290, 530, 0.92, "c"],
];

/** Árvores pequenas (paradas). */
const GROVE_SMALL: [number, number, number][] = [
  [168, 492, 0.38],
  [192, 494, 0.34],
  [560, 496, 0.42],
  [640, 498, 0.36],
  [1150, 494, 0.36],
];

/**
 * Bosques do fundo: `big` e `small` são as peças da árvore (BackTree, BackPine,
 * árvore seca). Com `sway`, as grandes balançam (camada da vegetação).
 */
export function WideGrove({
  big,
  small,
  sway = false,
}: {
  big: ReactNode;
  small: ReactNode;
  sway?: boolean;
}) {
  return (
    <>
      {GROVE_BIG.map(([x, y, k, v]) => (
        <g key={`g${x}`} transform={`translate(${x} ${y}) scale(${k})`}>
          {sway ? <g className={v === "b" ? s.swayB : s.swayC}>{big}</g> : big}
        </g>
      ))}
      {GROVE_SMALL.map(([x, y, k]) => (
        <g key={`p${x}`} transform={`translate(${x} ${y}) scale(${k})`}>
          {small}
        </g>
      ))}
    </>
  );
}

/** Moitas baixas do campo (Clássico). */
export function WideBushes() {
  return (
    <g fill={c("canopy-dark")}>
      <path d="M74 540 q10 -14 22 -8 q10 -10 22 -2 q8 -2 10 10 h-54z" />
      <path d="M440 512 q8 -10 18 -6 q8 -8 18 -1 q6 -1 8 7 h-44z" />
      <path d="M860 516 q8 -10 18 -6 q8 -8 18 -1 q6 -1 8 7 h-44z" />
      <path d="M1220 540 q10 -14 22 -8 q10 -10 22 -2 q8 -2 10 10 h-54z" />
    </g>
  );
}

// Flores -----------------------------------------------------------------------------

export type FlowerSpot = [x: number, y: number, scale: number, kind: string];

const BOB = [s.bob, s.bobB, s.bobC];

/** Flores da frente (camada animada "flores"): cada `kind` vira uma peça. */
export function WideFlowers({
  spots,
  pieces,
}: {
  spots: FlowerSpot[];
  pieces: Record<string, ReactNode>;
}) {
  return (
    <>
      {spots.map(([x, y, k, kind], i) => (
        <g key={x} transform={`translate(${x} ${y})${k === 1 ? "" : ` scale(${k})`}`}>
          <g className={BOB[i % 3]}>{pieces[kind]}</g>
        </g>
      ))}
    </>
  );
}

/** Posições das flores das referências (as mesmas nos 4 temas; cada tema escolhe as peças). */
export const FLOWER_SPOTS = {
  classico: [
    [46, 640, 1, "tulipa"],
    [116, 650, 1, "margarida"],
    [196, 654, 0.8, "botao"],
    [250, 650, 1, "ramo"],
    [320, 652, 1, "margarida"],
    [396, 640, 1.1, "tulipa"],
    [470, 656, 0.75, "botao"],
    [560, 660, 0.85, "margarida"],
    [646, 650, 0.9, "tulipa"],
    [700, 654, 1, "ramo"],
    [770, 648, 1, "botao"],
    [850, 646, 1.08, "margarida"],
    [930, 646, 1, "tulipa"],
    [1086, 656, 0.8, "botao"],
    [1160, 660, 0.9, "margarida"],
    [1214, 650, 1, "ramo"],
    [1290, 644, 1, "tulipa"],
  ],
  noturno: [
    [46, 640, 1, "tulipa"],
    [116, 650, 1, "margarida"],
    [196, 654, 0.8, "botao"],
    [250, 650, 1, "botao"],
    [320, 652, 1, "margarida"],
    [396, 640, 1.1, "tulipa"],
    [470, 656, 0.75, "botao"],
    [560, 660, 0.85, "margarida"],
    [646, 650, 0.9, "tulipa"],
    [700, 654, 1, "botao"],
    [770, 648, 1, "botao"],
    [850, 646, 1.08, "margarida"],
    [930, 646, 1, "tulipa"],
    [1086, 656, 0.8, "botao"],
    [1160, 660, 0.9, "margarida"],
    [1214, 650, 1, "botao"],
    [1290, 644, 1, "tulipa"],
  ],
  halloween: [
    [46, 640, 1, "flor"],
    [116, 650, 1, "flor"],
    [250, 650, 1, "botao"],
    [320, 652, 1, "flor"],
    [396, 640, 1.1, "flor"],
    [470, 656, 0.75, "botao"],
    [646, 650, 0.9, "flor"],
    [700, 654, 1, "botao"],
    [770, 648, 1, "botao"],
    [850, 646, 1.08, "flor"],
    [930, 646, 1, "flor"],
    [1086, 656, 0.8, "botao"],
    [1160, 660, 0.9, "flor"],
    [1290, 644, 1, "flor"],
  ],
  natal: [
    [46, 640, 1, "flor"],
    [116, 650, 1, "flor"],
    [196, 654, 0.8, "azevinho"],
    [250, 650, 1, "azevinho"],
    [320, 652, 1, "flor"],
    [396, 640, 1.1, "flor"],
    [470, 656, 0.75, "azevinho"],
    [560, 660, 0.85, "flor"],
    [646, 650, 0.9, "flor"],
    [700, 654, 1, "azevinho"],
    [770, 648, 1, "azevinho"],
    [850, 646, 1.08, "flor"],
    [930, 646, 1, "flor"],
    [1086, 656, 0.8, "azevinho"],
    [1290, 644, 1, "flor"],
  ],
} satisfies Record<string, FlowerSpot[]>;

// Partículas -------------------------------------------------------------------------

/** Gerador pseudoaleatório determinístico (mesma neve e estrelas a cada render). */
function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}

export type Dot = [cx: number, cy: number, r: number];

/** Flocos de um bloco de neve espalhados pela altura toda (0–844). */
export function snowBlock(count: number, rMin: number, rMax: number, seed: number): Dot[] {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => [
    Math.round(rnd() * WIDE_W),
    Math.round(rnd() * WIDE_H),
    Math.round((rMin + rnd() * (rMax - rMin)) * 10) / 10,
  ]);
}
