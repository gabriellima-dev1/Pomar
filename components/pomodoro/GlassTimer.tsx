import { formatTimer } from "@/lib/timer";

/** Lua (Noturno, Halloween) ou estrela (Natal) atrás do painel, com halo. */
function Halo({ kind }: { kind: "moon" | "star" }) {
  return (
    <svg
      viewBox="-190 -190 380 380"
      width={380}
      height={380}
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <defs>
        <radialGradient id="halo-brilho" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="var(--scene-moon-glow)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--scene-moon-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="190" fill="url(#halo-brilho)" />
      {kind === "moon" ? (
        <>
          <circle r="150" fill="var(--scene-moon)" />
          <g fill="var(--scene-moon-crater)">
            <circle cx="-62" cy="-96" r="18" />
            <circle cx="86" cy="88" r="24" />
            <circle cx="104" cy="-70" r="12" />
            <circle cx="-110" cy="64" r="10" />
          </g>
        </>
      ) : (
        <path
          d="M0 -176 L41 -57 L167 -54 L66 22 L103 143 L0 70 L-103 143 L-66 22 L-167 -54 L-41 -57Z"
          fill="var(--scene-moon)"
          stroke="var(--scene-moon-crater)"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * Cronômetro em painel de vidro (Liquid Glass): translúcido com desfoque e fundo
 * opaco quando não há suporte ou com `prefers-reduced-transparency` (telas.md › 08).
 * Nos temas em que o cronômetro "mora" na lua ou na estrela (DESIGN §6.7), o astro
 * fica atrás do painel e o vidro fica mais opaco (`--glass-halo`) para manter o AA.
 */
export function GlassTimer({
  label,
  seconds,
  srLabel,
  halo = "plain",
}: {
  label: "Foco" | "Descanso" | "Pausado" | "Pronto";
  seconds: number;
  /** Texto para leitores de tela (o número muda a cada segundo e não é anunciado). */
  srLabel: string;
  halo?: "plain" | "moon" | "star";
}) {
  return (
    <div className="relative">
      {halo !== "plain" && <Halo kind={halo} />}
      <div
        className={`glass-panel relative flex w-[270px] flex-col items-center gap-2 rounded-[28px] px-6 pt-[18px] pb-[22px] ${halo !== "plain" ? "glass-halo" : ""}`}
      >
        <span className="text-caption rounded-full bg-[var(--scene-chip)] px-3 py-1 text-[var(--scene-on-chip)]">
          {label}
        </span>
        <div
          role="timer"
          aria-label={srLabel}
          className="font-display text-[64px] leading-none font-semibold tracking-[-1px] text-[var(--scene-ink)] tabular-nums"
        >
          {formatTimer(seconds)}
        </div>
      </div>
    </div>
  );
}
