/**
 * Partes comuns das cenas "Campo e montanhas" (docs/design/cenas/scene-*.html).
 * Todas as cores vêm dos tokens `--scene-*` do tema ativo (nunca hex aqui).
 */

import s from "./Scene.module.css";

export const c = (name: string) => `var(--scene-${name})`;

/** Céu em degradê (4 paradas por tema). */
export function Sky({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c("sky-top")} />
          <stop offset="0.55" stopColor={c("sky-mid")} />
          <stop offset="0.82" stopColor={c("sky-low")} />
          <stop offset="1" stopColor={c("sky-bottom")} />
        </linearGradient>
      </defs>
      <rect x="-1200" width="2790" height="844" fill={`url(#${id})`} />
    </>
  );
}

/** Lua (ou sol) com halo e crateras. */
export function Moon({
  id,
  cx,
  cy,
  r,
  glow,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  glow: number;
}) {
  const k = r / 40;
  return (
    <>
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c("moon-glow")} stopOpacity="0.4" />
          <stop offset="1" stopColor={c("moon-glow")} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={glow} fill={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={r} fill={c("moon")} />
      <g fill={c("moon-crater")}>
        <circle cx={cx - 14 * k} cy={cy - 12 * k} r={6 * k} />
        <circle cx={cx + 12 * k} cy={cy + 14 * k} r={8 * k} />
        <circle cx={cx + 14 * k} cy={cy - 14 * k} r={4 * k} />
      </g>
    </>
  );
}

/** Nuvens das duas laterais e a do meio (Clássico, Noturno, Natal). */
export function Clouds({ shade = true, opacity = 1 }: { shade?: boolean; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <g className={s.drift}>
        {shade && (
          <g fill={c("cloud-shade")}>
            <circle cx="-6" cy="250" r="54" />
            <circle cx="46" cy="290" r="40" />
            <circle cx="10" cy="330" r="44" />
            <circle cx="150" cy="392" r="24" />
            <circle cx="178" cy="404" r="20" />
            <circle cx="204" cy="414" r="18" />
          </g>
        )}
        <g fill={c("cloud")}>
          <circle cx="-14" cy="240" r="48" />
          <circle cx="36" cy="282" r="34" />
          <circle cx="0" cy="322" r="38" />
          <circle cx="146" cy="386" r="22" />
          <circle cx="174" cy="398" r="18" />
          <circle cx="200" cy="410" r="16" />
          <rect x="128" y="398" width="90" height="26" />
        </g>
      </g>
      <g className={s.drift2}>
        {shade && (
          <g fill={c("cloud-shade")}>
            <circle cx="372" cy="230" r="50" />
            <circle cx="400" cy="290" r="54" />
            <circle cx="330" cy="300" r="34" />
          </g>
        )}
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
    </g>
  );
}

/** Montanhas (face clara e escura), com neve/brilho no pico opcional. */
export function Mountains({ caps }: { caps?: "glint" | "snow" }) {
  return (
    <>
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
      {caps === "glint" && (
        <path
          d="M92 330 L80 362 L96 356 Z M300 380 L290 402 L304 396Z"
          fill={c("snowcap")}
          opacity="0.6"
        />
      )}
      {caps === "snow" && (
        <path
          d="M92 330 L132 364 L118 362 L108 374 L96 362 L84 372 L74 360 L60 366Z M300 380 L336 406 L324 404 L314 414 L304 404 L294 412 L286 402 L272 408Z"
          fill={c("snowcap")}
        />
      )}
    </>
  );
}

/** Campo ao fundo, atrás das árvores pequenas. */
export function Field() {
  return (
    <>
      <path d="M-1200 474 C100 482 220 488 1590 470 V580 H-1200Z" fill={c("field")} />
      <path
        d="M0 474 C100 482 220 488 390 470 V480 C220 498 100 492 0 484Z"
        fill={c("field-rim")}
      />
    </>
  );
}

/** Prado em primeiro plano + caminho (+ tufos). */
export function Meadow({ marks = true }: { marks?: boolean }) {
  return (
    <>
      <path d="M-1200 568 C120 556 260 546 1590 534 V844 H-1200Z" fill={c("meadow")} />
      <path
        d="M-1200 568 C120 556 260 546 1590 534 V552 C260 562 120 572 -1200 586Z"
        fill={c("path")}
      />
      {marks && (
        <g fill={c("meadow-mark")}>
          <ellipse cx="60" cy="612" rx="7" ry="2.4" />
          <ellipse cx="150" cy="598" rx="7" ry="2.4" />
          <ellipse cx="220" cy="624" rx="7" ry="2.4" />
          <ellipse cx="300" cy="606" rx="7" ry="2.4" />
          <ellipse cx="110" cy="640" rx="7" ry="2.4" />
          <ellipse cx="260" cy="646" rx="7" ry="2.4" />
        </g>
      )}
    </>
  );
}

/** Arbustos (ou montes de neve) da frente. */
export function FrontShrubs({ snow = false }: { snow?: boolean }) {
  return (
    <>
      <g fill={c("shrub-dark")}>
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
      {snow ? (
        <g fill={c("shrub-light")}>
          <circle cx="20" cy="690" r="22" />
          <circle cx="96" cy="694" r="18" />
          <circle cx="190" cy="696" r="16" />
          <circle cx="316" cy="694" r="20" />
          <circle cx="370" cy="690" r="22" />
        </g>
      ) : (
        <g fill={c("shrub-light")}>
          <circle cx="-4" cy="658" r="16" />
          <circle cx="38" cy="668" r="14" />
          <circle cx="204" cy="668" r="12" />
          <circle cx="334" cy="664" r="14" />
          <circle cx="378" cy="654" r="16" />
        </g>
      )}
    </>
  );
}

/** Árvore do fundo (copa clara atrás, copa escura na frente, tronco). */
export function BackTree({ light = true, full = true }: { light?: boolean; full?: boolean }) {
  return (
    <>
      {light && (
        <g fill={c("canopy-light")}>
          <circle cx="6" cy="-78" r="22" />
          <circle cx="18" cy="-60" r="18" />
          {full && <circle cx="-2" cy="-98" r="16" />}
        </g>
      )}
      <g fill={c("canopy-dark")}>
        <circle cx="-2" cy="-72" r="22" />
        <circle cx="-14" cy="-56" r="18" />
        <circle cx="10" cy="-54" r="17" />
        <circle cx="-8" cy="-92" r="15" />
        {full && <circle cx="0" cy="-42" r="15" />}
      </g>
      <path d="M-2 0 L-1 -82 L1 -82 L2 0Z" fill={c("trunk")} />
    </>
  );
}

/** Pinheiro do fundo (Natal). */
export function BackPine({ light = true, caps = 3 }: { light?: boolean; caps?: 0 | 1 | 2 | 3 }) {
  const snow = [
    "M0 -100 L-7 -86 L0 -89 L7 -86Z",
    "M-12 -64 L12 -64 L8 -60 L2 -63 L-4 -60Z",
    "M-18 -36 L18 -36 L12 -32 L4 -35 L-6 -32Z",
  ].slice(0, caps);
  return (
    <>
      <path
        d="M0 -100 L-18 -64 L18 -64Z M0 -76 L-26 -36 L26 -36Z M0 -50 L-34 -6 L34 -6Z"
        fill={c("canopy-dark")}
      />
      {light && (
        <path
          d="M0 -100 L18 -64 L0 -64Z M0 -76 L26 -36 L0 -36Z M0 -50 L34 -6 L0 -6Z"
          fill={c("canopy-light")}
        />
      )}
      {snow.length > 0 && <path d={snow.join(" ")} fill={c("snow")} />}
      <rect x="-3" y="-6" width="6" height="6" fill={c("trunk")} />
    </>
  );
}

/** Tulipa da frente (amarela no Clássico, lilás no Noturno/Halloween). */
export function Tulip({ wide = true }: { wide?: boolean }) {
  return (
    <>
      <path d="M0 0 C-2 -24 2 -44 0 -62" fill="none" stroke={c("stem")} strokeWidth="3" />
      <path d="M0 -24 C-18 -30 -30 -24 -34 -12 C-20 -10 -8 -14 0 -24Z" fill={c("stem")} />
      <path d="M-14 -62 C-16 -78 -8 -88 0 -92 C8 -88 16 -78 14 -62Z" fill={c("flower-yellow")} />
      <path d="M-8 -62 C-10 -74 -4 -82 0 -84 C4 -82 10 -74 8 -62Z" fill={c("flower-gold")} />
      {wide && (
        <path
          d="M-18 -70 C-12 -66 -8 -62 -4 -60 M18 -70 C12 -66 8 -62 4 -60"
          stroke={c("flower-yellow")}
          strokeWidth="7"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

/** Tulipa pequena. */
export function SmallTulip() {
  return (
    <>
      <path d="M0 0 C-1 -14 1 -24 0 -36" fill="none" stroke={c("stem")} strokeWidth="2.6" />
      <path d="M0 -14 C-12 -20 -20 -16 -24 -8 C-12 -6 -6 -9 0 -14Z" fill={c("stem")} />
      <path d="M-10 -36 C-11 -48 -6 -55 0 -58 C6 -55 11 -48 10 -36Z" fill={c("flower-yellow")} />
      <path d="M-5 -36 C-6 -44 -3 -49 0 -50 C3 -49 6 -44 5 -36Z" fill={c("flower-gold")} />
    </>
  );
}

/** Flor de 5 pétalas com caule (coral no Clássico, branca no Noturno). */
export function PetalFlower({ height = 52, veins = false }: { height?: number; veins?: boolean }) {
  return (
    <>
      <path
        d={`M0 0 C2 -${height * 0.4} -2 -${height * 0.7} 0 -${height}`}
        fill="none"
        stroke={c("stem")}
        strokeWidth="3"
      />
      <path d="M0 -20 C14 -28 26 -24 30 -12 C16 -10 6 -14 0 -20Z" fill={c("stem")} />
      <g transform={`translate(0 -${height + 12})`}>
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
      </g>
    </>
  );
}

/** Bico-de-papagaio (Natal). */
export function Poinsettia({ height = 46, leaf = true }: { height?: number; leaf?: boolean }) {
  return (
    <>
      <path
        d={`M0 0 C-2 -${height * 0.4} 2 -${height * 0.7} 0 -${height}`}
        fill="none"
        stroke={c("stem")}
        strokeWidth="3"
      />
      {leaf && <path d="M0 -18 C-14 -24 -24 -20 -28 -10 C-16 -8 -6 -12 0 -18Z" fill={c("stem")} />}
      <g transform={`translate(0 -${height + 10})`}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            d="M0 0 L-4 -16 L0 -20 L4 -16Z"
            fill={c("flower-yellow")}
            transform={deg ? `rotate(${deg})` : undefined}
          />
        ))}
        <circle r="4" fill={c("flower-gold")} />
      </g>
    </>
  );
}

/** Abóbora (Halloween). */
export function Pumpkin({
  rx = 18,
  ry = 13,
  face = false,
}: {
  rx?: number;
  ry?: number;
  face?: boolean;
}) {
  return (
    <>
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={c("pumpkin")} />
      <path
        d={`M0 -${ry} C-${rx * 0.45} -${ry * 0.45} -${rx * 0.45} ${ry * 0.45} 0 ${ry} M0 -${ry} C${rx * 0.45} -${ry * 0.45} ${rx * 0.45} ${ry * 0.45} 0 ${ry}`}
        fill="none"
        stroke={c("pumpkin-line")}
        strokeWidth="1.6"
      />
      <path
        d={`M0 -${ry} q2 -6 6 -7`}
        stroke={c("leaf")}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {face && (
        <g className={s.glow}>
          <path
            d="M-8 -3 l3 -4 3 4z M2 -3 l3 -4 3 4z M-7 4 q7 5 14 0 l-2 3 -2 -2 -2 2 -2 -2 -2 2z"
            fill={c("critter-glow")}
          />
        </g>
      )}
    </>
  );
}
