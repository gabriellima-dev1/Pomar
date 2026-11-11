import type { Tier } from "@/lib/gamification/harvest";
import { TIER_LABEL } from "@/lib/gamification/harvest";

/**
 * Medalhas da colheita semanal (docs/design/colheitas/*.svg, 40×44), cores pelos
 * tokens `medal-*`. `tier = null` desenha a marca de "semana mais leve".
 */
export function HarvestMedal({
  tier,
  size = 40,
  label,
}: {
  tier: Tier | null;
  size?: number;
  /** Sem rótulo, a medalha é decorativa. */
  label?: string;
}) {
  const height = (size * 44) / 40;
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true };
  if (!tier) {
    return (
      <svg viewBox="0 0 40 44" width={size} height={height} {...a11y} className="shrink-0">
        <circle cx="20" cy="27" r="15" fill="var(--surface-300)" />
        <circle
          cx="20"
          cy="27"
          r="11"
          fill="none"
          stroke="var(--line)"
          strokeWidth="2.5"
          strokeDasharray="3 4"
        />
        <circle cx="15" cy="28" r="3" fill="var(--fruit-unripe)" />
        <circle cx="25" cy="28" r="3" fill="var(--fruit-unripe)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 44" width={size} height={height} {...a11y} className="shrink-0">
      <path d="M12 2h7l-3 14h-7z" fill="var(--primary)" />
      <path d="M28 2h-7l3 14h7z" fill="var(--primary-strong)" />
      <circle cx="20" cy="27" r="15" fill={`var(--medal-${tier})`} />
      <circle
        cx="20"
        cy="27"
        r="11"
        fill="none"
        stroke={`var(--medal-${tier}-edge)`}
        strokeWidth="2.5"
      />
      <circle cx="20" cy="28" r="5.5" fill="var(--scene-fruit-ripe)" />
      <path
        d="M20 22.5v-3"
        stroke="var(--scene-canopy-dark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Bolinha pequena da medalha (chips de total, tela 10). */
export function MedalDot({ tier }: { tier: Tier }) {
  return (
    <span
      aria-hidden
      className="inline-block size-5 shrink-0 rounded-full border-[3px]"
      style={{ background: `var(--medal-${tier})`, borderColor: `var(--medal-${tier}-edge)` }}
      title={TIER_LABEL[tier]}
    />
  );
}
