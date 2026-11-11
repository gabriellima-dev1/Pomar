import { Fragment } from "react";
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
