"use client";

import { useEffect, useState } from "react";
import s from "./Scene.module.css";

/**
 * Cena do pomodoro "Campo e montanhas", tema Clássico
 * (docs/design/cenas/scene-classico.html → SVG inline, cores em tokens `--scene-*`).
 * A árvore do pomar é a grande à direita; o fruto verde amadurece com o progresso
 * do foco e é colhido no fim. As outras cenas (Noturno, Halloween, Natal) são da Fase 3.
 */

const c = (name: string) => `var(--scene-${name})`;

/** Árvore do fundo (copa clara atrás, copa escura na frente, tronco e galhos). */
function BackTree({ full = true }: { full?: boolean }) {
  return (
    <>
      {full && <ellipse cx="0" cy="0" rx="16" ry="3" fill={c("tree-shadow")} />}
      <g fill={c("canopy-light")}>
        <circle cx="6" cy="-78" r="22" />
        <circle cx="18" cy="-60" r="18" />
        {full && <circle cx="-2" cy="-98" r="16" />}
      </g>
      <g fill={c("canopy-dark")}>
        <circle cx="-2" cy="-72" r="22" />
        <circle cx="-14" cy="-56" r="18" />
        <circle cx="10" cy="-54" r="17" />
        <circle cx="-8" cy="-92" r="15" />
        <circle cx="0" cy="-42" r="15" />
      </g>
      <path d="M-2 0 L-1 -82 L1 -82 L2 0Z" fill={c("trunk")} />
      {full && (
        <path
          d="M0 -40 L-12 -52 M0 -48 L10 -60 M0 -64 L-8 -74"
          stroke={c("trunk")}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

/** Árvore bem pequena, ao longe. */
function TinyTree({ light = false }: { light?: boolean }) {
  return (
    <>
      {light && (
        <g fill={c("canopy-light")}>
          <circle cx="6" cy="-78" r="22" />
          <circle cx="18" cy="-60" r="18" />
        </g>
      )}
      <g fill={c("canopy-dark")}>
        <circle cx="-2" cy="-72" r="22" />
        <circle cx="-12" cy="-56" r="18" />
        <circle cx="10" cy="-56" r="17" />
        <circle cx="-4" cy="-92" r="15" />
      </g>
      <path d="M-2 0 L-1 -82 L1 -82 L2 0Z" fill={c("trunk")} />
    </>
  );
}

/** Tulipa pequena. */
function SmallTulip() {
  return (
    <>
      <path d="M0 0 C-1 -14 1 -24 0 -36" fill="none" stroke={c("canopy-dark")} strokeWidth="2.6" />
      <path d="M0 -14 C-12 -20 -20 -16 -24 -8 C-12 -6 -6 -9 0 -14Z" fill={c("canopy-dark")} />
      <path d="M-10 -36 C-11 -48 -6 -55 0 -58 C6 -55 11 -48 10 -36Z" fill={c("flower-yellow")} />
      <path d="M-5 -36 C-6 -44 -3 -49 0 -50 C3 -49 6 -44 5 -36Z" fill={c("flower-gold")} />
    </>
  );
}

function Petals({ veins = false }: { veins?: boolean }) {
  return (
    <>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-13"
          rx="8"
          ry="13"
          fill={c("flower-coral")}
          transform={deg ? `rotate(${deg})` : undefined}
        />
      ))}
      {veins && (
        <path
          d="M0 -6 V-20 M0 0 L13 -4 M0 0 L8 11 M0 0 L-8 11 M0 0 L-13 -4"
          stroke={c("flower-coral-light")}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      <circle r="6" fill={c("flower-center")} />
    </>
  );
}

export function Scene({
  progress,
  harvested = false,
}: {
  /** Progresso do foco (0–1): amadurece o fruto da árvore do pomar. */
  progress: number;
  /** Fim do foco: o fruto é colhido. */
  harvested?: boolean;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const p = Math.max(0, Math.min(1, progress));

  return (
    <svg
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMax meet"
      className={`absolute inset-0 h-full w-full ${hidden ? s.hidden : ""}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="cena-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c("sky-top")} />
          <stop offset="1" stopColor={c("sky-bottom")} />
        </linearGradient>
      </defs>
      <rect x="-1200" width="2790" height="844" fill="url(#cena-ceu)" />

      {/* 1 · nuvens */}
      <g className={s.drift}>
        <g fill={c("cloud-shade")}>
          <circle cx="-6" cy="250" r="54" />
          <circle cx="46" cy="290" r="40" />
          <circle cx="10" cy="330" r="44" />
        </g>
        <g fill={c("cloud")}>
          <circle cx="-14" cy="240" r="48" />
          <circle cx="36" cy="282" r="34" />
          <circle cx="0" cy="322" r="38" />
        </g>
        <g fill={c("cloud-shade")}>
          <circle cx="150" cy="392" r="24" />
          <circle cx="178" cy="404" r="20" />
          <circle cx="204" cy="414" r="18" />
        </g>
        <g fill={c("cloud")}>
          <circle cx="146" cy="386" r="22" />
          <circle cx="174" cy="398" r="18" />
          <circle cx="200" cy="410" r="16" />
          <rect x="128" y="398" width="90" height="26" />
        </g>
      </g>
      <g className={s.drift2}>
        <g fill={c("cloud-shade")}>
          <circle cx="372" cy="230" r="50" />
          <circle cx="400" cy="290" r="54" />
          <circle cx="330" cy="300" r="34" />
        </g>
        <g fill={c("cloud")}>
          <circle cx="382" cy="222" r="44" />
          <circle cx="408" cy="282" r="48" />
          <circle cx="340" cy="294" r="28" />
          <rect x="330" y="294" width="80" height="40" />
          <circle cx="258" cy="380" r="22" />
          <circle cx="284" cy="370" r="26" />
          <circle cx="312" cy="384" r="18" />
          <rect x="240" y="384" width="90" height="22" />
        </g>
      </g>

      {/* Montanhas */}
      <path d="M-50 480 L92 330 L270 480Z" fill={c("mountain-light")} />
      <path
        d="M-50 480 L92 330 L80 362 L108 378 L34 418 L150 426 L196 480Z"
        fill={c("mountain-dark")}
      />
      <path d="M150 490 L300 380 L450 490Z" fill={c("mountain-light")} />
      <path
        d="M300 380 L290 402 L332 420 L292 440 L360 450 L390 490 L450 490Z"
        fill={c("mountain-dark")}
      />

      {/* Campo ao fundo */}
      <path d="M-1200 474 C100 482 220 488 1590 470 V580 H-1200Z" fill={c("field")} />
      <path
        d="M0 474 C100 482 220 488 390 470 V480 C220 498 100 492 0 484Z"
        fill={c("field-rim")}
      />

      {/* 2 · vegetação ao fundo */}
      <g transform="translate(32 528) scale(0.9)">
        <g className={s.swayB}>
          <BackTree />
        </g>
      </g>
      <g transform="translate(110 508) scale(0.7)">
        <g className={s.swayC}>
          <BackTree />
        </g>
      </g>
      <g transform="translate(160 490) scale(0.38)">
        <TinyTree />
      </g>
      <g transform="translate(184 492) scale(0.34)">
        <TinyTree />
      </g>
      <g transform="translate(214 498) scale(0.5)">
        <TinyTree light />
      </g>
      <path d="M60 540 q10 -14 22 -8 q10 -10 22 -2 q8 -2 10 10 h-54z" fill={c("canopy-dark")} />
      <path d="M190 516 q8 -10 18 -6 q8 -8 18 -1 q6 -1 8 7 h-44z" fill={c("canopy-dark")} />

      {/* Prado e caminho */}
      <path d="M-1200 568 C120 556 260 546 1590 534 V844 H-1200Z" fill={c("meadow")} />
      <path
        d="M-1200 568 C120 556 260 546 1590 534 V552 C260 562 120 572 -1200 586Z"
        fill={c("path")}
      />
      <g fill={c("meadow-mark")}>
        <ellipse cx="60" cy="612" rx="7" ry="2.4" />
        <ellipse cx="150" cy="598" rx="7" ry="2.4" />
        <ellipse cx="220" cy="624" rx="7" ry="2.4" />
        <ellipse cx="300" cy="606" rx="7" ry="2.4" />
        <ellipse cx="110" cy="640" rx="7" ry="2.4" />
        <ellipse cx="260" cy="646" rx="7" ry="2.4" />
      </g>

      {/* Árvore do pomar (a grande à direita) */}
      <g transform="translate(296 572) scale(2.1)">
        <g className={s.sway}>
          <ellipse cx="0" cy="0" rx="34" ry="5" fill={c("meadow-mark")} />
          <g fill={c("canopy-light")}>
            <circle cx="8" cy="-80" r="24" />
            <circle cx="22" cy="-60" r="20" />
            <circle cx="0" cy="-104" r="18" />
            <circle cx="18" cy="-96" r="16" />
          </g>
          <g fill={c("canopy-dark")}>
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
            <circle cx="-18" cy="-62" r="4" />
            <circle cx="14" cy="-84" r="4" />
            <circle cx="-6" cy="-100" r="3.6" />
          </g>
          {/* 4 · o fruto deste ciclo */}
          <g className={harvested ? s.harvest : undefined}>
            <circle cx="16" cy="-52" r="4.4" fill="var(--fruit-unripe)" />
            <circle
              cx="16"
              cy="-52"
              r="4.4"
              fill={c("fruit-ripe")}
              className={s.fruit}
              style={{ opacity: harvested ? 1 : p, transform: `scale(${0.6 + 0.4 * p})` }}
            />
            <ellipse
              cx="14.6"
              cy="-53.4"
              rx="1.2"
              ry="0.8"
              fill="var(--illo-shine)"
              opacity="0.7"
            />
          </g>
        </g>
      </g>

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
          <path
            d="M0 0 C-2 -24 2 -44 0 -62"
            fill="none"
            stroke={c("canopy-dark")}
            strokeWidth="3"
          />
          <path
            d="M0 -24 C-18 -30 -30 -24 -34 -12 C-20 -10 -8 -14 0 -24Z"
            fill={c("canopy-dark")}
          />
          <path
            d="M0 -24 C-12 -24 -22 -20 -30 -14"
            fill="none"
            stroke={c("canopy-light")}
            strokeWidth="1.4"
          />
          <path d="M0 -36 C16 -44 28 -40 32 -28 C18 -26 8 -30 0 -36Z" fill={c("canopy-dark")} />
          <path
            d="M-14 -62 C-16 -78 -8 -88 0 -92 C8 -88 16 -78 14 -62Z"
            fill={c("flower-yellow")}
          />
          <path d="M-8 -62 C-10 -74 -4 -82 0 -84 C4 -82 10 -74 8 -62Z" fill={c("flower-gold")} />
          <path
            d="M-18 -70 C-12 -66 -8 -62 -4 -60 M18 -70 C12 -66 8 -62 4 -60"
            stroke={c("flower-yellow")}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      </g>
      <g transform="translate(116 650)">
        <g className={s.bobB}>
          <path
            d="M0 0 C2 -20 -2 -36 0 -52"
            fill="none"
            stroke={c("canopy-dark")}
            strokeWidth="3"
          />
          <path d="M0 -20 C14 -28 26 -24 30 -12 C16 -10 6 -14 0 -20Z" fill={c("canopy-dark")} />
          <g transform="translate(0 -64)">
            <Petals veins />
          </g>
        </g>
      </g>
      <g transform="translate(196 646)">
        <g className={s.bobC}>
          <SmallTulip />
        </g>
      </g>
      <g transform="translate(300 652)">
        <g className={s.bob}>
          <path
            d="M0 0 C2 -22 -2 -40 0 -58"
            fill="none"
            stroke={c("canopy-dark")}
            strokeWidth="3"
          />
          <path
            d="M0 -26 C-16 -34 -28 -28 -32 -16 C-18 -14 -8 -18 0 -26Z"
            fill={c("canopy-dark")}
          />
          <g transform="translate(0 -70)">
            <Petals />
          </g>
        </g>
      </g>
      <g transform="translate(356 646)">
        <g className={s.bobB}>
          <path
            d="M0 0 C-2 -22 2 -40 0 -56"
            fill="none"
            stroke={c("canopy-dark")}
            strokeWidth="3"
          />
          <path d="M0 -24 C14 -32 26 -28 30 -16 C16 -14 6 -18 0 -24Z" fill={c("canopy-dark")} />
          <path
            d="M-14 -56 C-16 -72 -8 -82 0 -86 C8 -82 16 -72 14 -56Z"
            fill={c("flower-yellow")}
          />
          <path d="M-8 -56 C-10 -68 -4 -76 0 -78 C4 -76 10 -68 8 -56Z" fill={c("flower-gold")} />
          <path
            d="M-18 -64 C-12 -60 -8 -56 -4 -54 M18 -64 C12 -60 8 -56 4 -54"
            stroke={c("flower-yellow")}
            strokeWidth="7"
            strokeLinecap="round"
          />
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

      {/* Arbustos da frente */}
      <g fill={c("canopy-dark")}>
        <circle cx="0" cy="666" r="30" />
        <circle cx="40" cy="676" r="28" />
        <circle cx="80" cy="672" r="24" />
        <circle cx="120" cy="682" r="22" />
        <circle cx="170" cy="684" r="20" />
        <circle cx="206" cy="676" r="24" />
        <circle cx="244" cy="686" r="20" />
        <circle cx="296" cy="682" r="24" />
        <circle cx="336" cy="672" r="28" />
        <circle cx="376" cy="664" r="32" />
      </g>
      <g fill={c("shrub-light")}>
        <circle cx="-4" cy="658" r="16" />
        <circle cx="38" cy="668" r="14" />
        <circle cx="204" cy="668" r="12" />
        <circle cx="334" cy="664" r="14" />
        <circle cx="378" cy="654" r="16" />
      </g>
    </svg>
  );
}
