import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { DIVISION_LABEL, type Division } from "@/lib/league/divisions";

/** Divisões da Feira (DESIGN §6.6), cores pelos tokens `medal-*`. */
export const DIVISIONS = [
  { code: "bronze", label: DIVISION_LABEL.bronze, ink: "var(--medal-bronze-ink)" },
  { code: "prata", label: DIVISION_LABEL.prata, ink: "var(--medal-prata-ink)" },
  { code: "ouro", label: DIVISION_LABEL.ouro, ink: "var(--reward-mark)" },
  { code: "esmeralda", label: DIVISION_LABEL.esmeralda, ink: "var(--medal-esmeralda-ink)" },
] as const satisfies readonly { code: Division; label: string; ink: string }[];

/**
 * Medalha da divisão (desenho de docs/design/colheitas/*.svg, 40×44), nas cores
 * `medal-{divisão}`; a Esmeralda usa `medal-esmeralda*` (telas.md › 23).
 */
export function DivisionMedal({
  division,
  size = 56,
  label,
}: {
  division: Division;
  size?: number;
  label?: string;
}) {
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true };
  return (
    <svg viewBox="0 0 40 44" width={size} height={(size * 44) / 40} {...a11y} className="shrink-0">
      <path d="M12 2h7l-3 14h-7z" fill="var(--primary)" />
      <path d="M28 2h-7l3 14h7z" fill="var(--primary-strong)" />
      <circle cx="20" cy="27" r="15" fill={`var(--medal-${division})`} />
      <circle
        cx="20"
        cy="27"
        r="11"
        fill="none"
        stroke={`var(--medal-${division}-edge)`}
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

export function DivisionDisc({ division, size = 52 }: { division: Division; size?: number }) {
  return (
    <span
      aria-hidden
      className="block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `var(--medal-${division})`,
        border: `${Math.max(3, Math.round(size / 12))}px solid var(--medal-${division}-edge)`,
      }}
    />
  );
}

/** Bronze → Prata → Ouro → Esmeralda (tela 19); divide a largura sem estourar no celular. */
export function DivisionLadder() {
  return (
    <ol
      aria-label="Divisões da Feira, da primeira à última"
      className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start"
    >
      {DIVISIONS.map((d, i) => (
        <Fragment key={d.code}>
          <li className="flex min-w-0 flex-col items-center gap-2">
            <DivisionDisc division={d.code} size={48} />
            <span className="text-[13px] leading-4 font-extrabold" style={{ color: d.ink }}>
              {d.label}
            </span>
          </li>
          {i < DIVISIONS.length - 1 && (
            <li aria-hidden className="text-ink-muted mt-3.5">
              <ChevronRight size={16} />
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  );
}
