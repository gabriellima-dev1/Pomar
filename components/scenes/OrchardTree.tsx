import type { ReactNode } from "react";
import type { Stage } from "@/lib/gamification/levels";

/**
 * Árvore do pomar por estágio (DESIGN.md §6.2): muda → arbusto → árvore jovem →
 * adulta → frondosa. Mesmo desenho da cena "Campo e montanhas" (círculos cheios,
 * tronco, sem contorno), cores só de tokens `--scene-*`. Coordenadas locais: a base
 * do tronco fica em (0, 0) e a árvore cresce para cima.
 */

const c = (name: string) => `var(--scene-${name})`;

/** Posição do fruto deste ciclo (o que amadurece durante o foco), por estágio. */
export const FRUIT_ANCHOR: Record<Stage, { x: number; y: number; r: number }> = {
  muda: { x: 7, y: -25, r: 3.6 },
  arbusto: { x: 12, y: -31, r: 4 },
  jovem: { x: 13, y: -42, r: 4 },
  adulta: { x: 16, y: -52, r: 4.4 },
  frondosa: { x: 17, y: -56, r: 4.6 },
};

/** Caixa (x, y, largura, altura) que contém cada estágio, para miniaturas. */
export const STAGE_BOX: Record<Stage, [number, number, number, number]> = {
  muda: [-24, -52, 48, 56],
  arbusto: [-34, -66, 70, 72],
  jovem: [-38, -104, 76, 110],
  adulta: [-44, -126, 88, 132],
  frondosa: [-54, -144, 108, 150],
};

function Muda() {
  return (
    <>
      <ellipse cx="0" cy="0" rx="14" ry="2.6" fill={c("tree-shadow")} />
      <path d="M-1.6 0 L-0.8 -24 L0.8 -24 L1.6 0Z" fill={c("trunk")} />
      <circle cx="6" cy="-38" r="9" fill={c("canopy-light")} />
      <g fill={c("canopy-dark")}>
        <circle cx="-8" cy="-26" r="10" />
        <circle cx="8" cy="-26" r="10" />
        <circle cx="0" cy="-36" r="10" />
      </g>
    </>
  );
}

function Arbusto() {
  return (
    <>
      <ellipse cx="0" cy="0" rx="24" ry="3.4" fill={c("tree-shadow")} />
      <path d="M-2 0 L-1 -30 L1 -30 L2 0Z" fill={c("trunk")} />
      <g fill={c("canopy-light")}>
        <circle cx="10" cy="-46" r="16" />
        <circle cx="20" cy="-30" r="13" />
      </g>
      <g fill={c("canopy-dark")}>
        <circle cx="-12" cy="-30" r="15" />
        <circle cx="9" cy="-26" r="14" />
        <circle cx="-2" cy="-44" r="16" />
        <circle cx="-18" cy="-44" r="10" />
      </g>
      <circle cx="-13" cy="-36" r="3.6" fill={c("fruit-ripe")} />
    </>
  );
}

/** Árvore completa (a grande da cena). `extra` acrescenta copa na frondosa. */
function FullTree({ ripe, extra = false }: { ripe: [number, number, number][]; extra?: boolean }) {
  return (
    <>
      <ellipse cx="0" cy="0" rx={extra ? 42 : 34} ry="5" fill={c("tree-shadow")} />
      <g fill={c("canopy-light")}>
        {extra && (
          <>
            <circle cx="-30" cy="-66" r="16" />
            <circle cx="32" cy="-80" r="18" />
            <circle cx="-14" cy="-118" r="14" />
          </>
        )}
        <circle cx="8" cy="-80" r="24" />
        <circle cx="22" cy="-60" r="20" />
        <circle cx="0" cy="-104" r="18" />
        <circle cx="18" cy="-96" r="16" />
      </g>
      <g fill={c("canopy-dark")}>
        {extra && (
          <>
            <circle cx="28" cy="-62" r="16" />
            <circle cx="-30" cy="-54" r="15" />
            <circle cx="4" cy="-120" r="15" />
          </>
        )}
        <circle cx="-2" cy="-74" r="24" />
        <circle cx="-16" cy="-58" r="20" />
        <circle cx="12" cy="-56" r="19" />
        <circle cx="-8" cy="-96" r="17" />
        <circle cx="6" cy="-92" r="16" />
        <circle cx="0" cy="-42" r="16" />
        <circle cx="-22" cy="-80" r="12" />
      </g>
      <path d="M-3 0 L-1 -86 L1 -86 L3 0Z" fill={c("trunk")} />
      <path
        d="M0 -38 L-14 -50 M0 -46 L12 -60 M0 -64 L-10 -76 M0 -72 L8 -84"
        stroke={c("trunk")}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g fill={c("fruit-ripe")}>
        {ripe.map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </>
  );
}

const ADULT_RIPE: [number, number, number][] = [
  [-18, -62, 4],
  [14, -84, 4],
  [-6, -100, 3.6],
];

/** Desenho da árvore do estágio (sem o fruto do ciclo). */
export function OrchardTreeShape({ stage }: { stage: Stage }) {
  switch (stage) {
    case "muda":
      return <Muda />;
    case "arbusto":
      return <Arbusto />;
    case "jovem":
      return (
        <g transform="scale(0.8)">
          <FullTree ripe={ADULT_RIPE.slice(0, 2)} />
        </g>
      );
    case "adulta":
      return <FullTree ripe={ADULT_RIPE} />;
    case "frondosa":
      return (
        <g transform="scale(1.06)">
          <FullTree extra ripe={[...ADULT_RIPE, [26, -66, 4], [-28, -84, 3.8], [6, -116, 3.6]]} />
        </g>
      );
  }
}

/**
 * Árvore com o fruto do ciclo. `fruit` recebe o grupo do fruto já posicionado no
 * ponto do estágio (a cena decide como ele amadurece e é colhido).
 */
export function OrchardTree({ stage, fruit }: { stage: Stage; fruit?: ReactNode }) {
  const a = FRUIT_ANCHOR[stage];
  return (
    <>
      <OrchardTreeShape stage={stage} />
      {fruit && <g transform={`translate(${a.x} ${a.y})`}>{fruit}</g>}
    </>
  );
}

/** Miniatura do estágio (card de nível, tela 09): céu + chão + árvore. */
export function MiniTree({
  stage,
  width = 64,
  height = 72,
  className = "",
}: {
  stage: Stage;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [, , w, h] = STAGE_BOX[stage];
  const scale = Math.min(width / w, (height - 8) / h);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      className={`shrink-0 overflow-hidden rounded-md ${className}`}
    >
      <rect width={width} height={height} fill={c("sky-bottom")} />
      <ellipse cx={width / 2} cy={height + 4} rx={width * 0.7} ry="12" fill={c("meadow")} />
      <g transform={`translate(${width / 2} ${height - 6}) scale(${scale})`}>
        <OrchardTreeShape stage={stage} />
      </g>
    </svg>
  );
}
