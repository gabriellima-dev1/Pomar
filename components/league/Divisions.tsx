import { ChevronRight } from "lucide-react";

/** Divisões da Feira (DESIGN §6.6), cores pelos tokens `medal-*`. */
export const DIVISIONS = [
  { code: "bronze", label: "Bronze", ink: "var(--medal-bronze-ink)" },
  { code: "prata", label: "Prata", ink: "var(--medal-prata-ink)" },
  { code: "ouro", label: "Ouro", ink: "var(--reward-mark)" },
  { code: "esmeralda", label: "Esmeralda", ink: "var(--medal-esmeralda-ink)" },
] as const;

export type Division = (typeof DIVISIONS)[number]["code"];

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

/** Bronze → Prata → Ouro → Esmeralda (tela 19). */
export function DivisionLadder() {
  return (
    <ol
      aria-label="Divisões da Feira, da primeira à última"
      className="flex items-start justify-between gap-1"
    >
      {DIVISIONS.map((d, i) => (
        <li key={d.code} className="flex items-start gap-1">
          <span className="flex w-[4.5rem] flex-col items-center gap-2">
            <DivisionDisc division={d.code} />
            <span className="text-small font-extrabold" style={{ color: d.ink }}>
              {d.label}
            </span>
          </span>
          {i < DIVISIONS.length - 1 && (
            <ChevronRight size={18} aria-hidden className="text-ink-muted mt-4 shrink-0" />
          )}
        </li>
      ))}
    </ol>
  );
}
