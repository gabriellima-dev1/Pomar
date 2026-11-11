/**
 * Seu Tomás, o mascote (docs/design/ilustracoes/seu-tomas*.svg).
 * Cores só de tokens; `mood="pensativo"` tem o sorriso menor (pop-up de pausa).
 *
 * Acessório por tema (DESIGN §6.7): pijama (Noturno), fantasia de abóbora (Halloween)
 * e gorro (Natal). Com `accessory="auto"` (padrão) o acessório segue o `data-theme`
 * da página por CSS (globals.css › Seu Tomás), inclusive o Noturno automático do modo
 * escuro. Telas com um tema fixo (ex.: "Tema desbloqueado") passam o acessório.
 */

export type MascotAccessory = "auto" | "basico" | "noturno" | "halloween" | "natal";

function Nightcap() {
  return (
    <>
      <path
        fill="var(--subject-ceu)"
        d="M14 24 C16 10 30 3 44 6 C52 8 56 14 56 22 C52 17 48 16 46 19 C40 15 26 15 14 24Z"
      />
      <path
        fill="none"
        stroke="var(--illo-shine)"
        strokeWidth="3.5"
        strokeLinecap="round"
        d="M14 24 Q32 13 48 20"
      />
      <circle fill="var(--illo-shine)" cx="56" cy="23" r="4.5" />
    </>
  );
}

function PumpkinCostume() {
  return (
    <>
      <path
        fill="none"
        stroke="var(--on-reward)"
        strokeWidth="1.8"
        opacity="0.28"
        strokeLinecap="round"
        d="M32 16 C22 24 22 50 32 59 M32 16 C42 24 42 50 32 59 M20 21 C12 30 12 46 18 54 M44 21 C52 30 52 46 46 54"
      />
      <path fill="var(--subject-terra)" d="M30 17 C29 11 31 7 35 5 L37 8 C34 10 33 13 34 17Z" />
      <path
        fill="none"
        stroke="var(--subject-folha)"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M35 9 C40 4 46 6 45 11"
      />
    </>
  );
}

function SantaHat() {
  return (
    <>
      <path
        fill="var(--danger)"
        d="M15 23 C18 9 32 2 46 6 C53 8 57 13 57 19 C53 16 49 16 47 20 C40 15 26 15 15 23Z"
      />
      <path
        fill="none"
        stroke="var(--illo-shine)"
        strokeWidth="5"
        strokeLinecap="round"
        d="M13 24 Q32 12 50 21"
      />
      <circle fill="var(--illo-shine)" cx="57" cy="20" r="4.5" />
    </>
  );
}

const ACCESSORIES = {
  noturno: Nightcap,
  halloween: PumpkinCostume,
  natal: SantaHat,
} as const;

export function SeuTomas({
  size = 64,
  mood = "feliz",
  accessory = "auto",
  label,
  className,
}: {
  size?: number;
  mood?: "feliz" | "pensativo";
  accessory?: MascotAccessory;
  /** Sem rótulo, a ilustração é decorativa. */
  label?: string;
  className?: string;
}) {
  const auto = accessory === "auto";
  const showLeaf = auto || accessory === "basico";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <ellipse fill="var(--fruit)" cx="32" cy="37" rx="25" ry="22" />
      <ellipse
        fill="var(--illo-shine)"
        opacity="0.55"
        cx="21"
        cy="28"
        rx="6"
        ry="4"
        transform="rotate(-25 21 28)"
      />
      {showLeaf && (
        <g className={auto ? "tomas-leaf" : undefined}>
          <path
            fill="var(--subject-folha)"
            d="M32 17c-3-6-9-7-13-5 4 1 6 3 7 6-5-1-9 1-11 4 6-1 10 0 13 2 0-3 2-5 4-6 2 1 4 3 4 6 3-2 7-3 13-2-2-3-6-5-11-4 1-3 3-5 7-6-4-2-10-1-13 5z"
          />
          <rect fill="var(--subject-folha)" x="30.5" y="8" width="3" height="8" rx="1.5" />
        </g>
      )}
      <circle fill="var(--on-reward)" cx="24" cy="38" r="3" />
      <circle fill="var(--on-reward)" cx="40" cy="38" r="3" />
      <ellipse fill="var(--illo-blush)" opacity="0.8" cx="18" cy="45" rx="4" ry="2.5" />
      <ellipse fill="var(--illo-blush)" opacity="0.8" cx="46" cy="45" rx="4" ry="2.5" />
      <path
        d={mood === "feliz" ? "M27 46c3 3 7 3 10 0" : "M28.5 47.5c2.2-1.6 4.8-1.6 7 0"}
        fill="none"
        stroke="var(--on-reward)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {(Object.keys(ACCESSORIES) as (keyof typeof ACCESSORIES)[]).map((key) => {
        if (!auto && accessory !== key) return null;
        const Acc = ACCESSORIES[key];
        return (
          <g key={key} className={auto ? "tomas-acc" : undefined} data-acc={key}>
            <Acc />
          </g>
        );
      })}
    </svg>
  );
}
