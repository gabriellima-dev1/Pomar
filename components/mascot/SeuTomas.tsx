/**
 * Seu Tomás, o mascote (docs/design/ilustracoes/seu-tomas.svg).
 * Cores só de tokens; `mood="pensativo"` tem o sorriso menor (pop-up de pausa).
 */
export function SeuTomas({
  size = 64,
  mood = "feliz",
  label,
  className,
}: {
  size?: number;
  mood?: "feliz" | "pensativo";
  /** Sem rótulo, a ilustração é decorativa. */
  label?: string;
  className?: string;
}) {
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
      <path
        fill="var(--subject-folha)"
        d="M32 17c-3-6-9-7-13-5 4 1 6 3 7 6-5-1-9 1-11 4 6-1 10 0 13 2 0-3 2-5 4-6 2 1 4 3 4 6 3-2 7-3 13-2-2-3-6-5-11-4 1-3 3-5 7-6-4-2-10-1-13 5z"
      />
      <rect fill="var(--subject-folha)" x="30.5" y="8" width="3" height="8" rx="1.5" />
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
    </svg>
  );
}
