import { Flame, Snowflake, Star } from "lucide-react";

/** Pílula de 32px: ofensiva, XP ou nível (docs/design/telas.md › StatChip). */
export function StatChip({
  kind,
  value,
  freezes = 0,
}: {
  kind: "ofensiva" | "xp" | "nivel";
  value: number;
  /** Congelamentos guardados (só na ofensiva; DESIGN §6.3). */
  freezes?: number;
}) {
  if (kind === "ofensiva") {
    const active = value > 0;
    return (
      <span
        className={`text-small inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-extrabold ${
          active ? "bg-fruit-soft text-ink" : "bg-surface-300 text-ink-muted"
        }`}
      >
        <Flame
          size={16}
          aria-hidden
          className={active ? "text-fruit" : "text-ink-muted"}
          fill="currentColor"
          strokeWidth={0}
        />
        {value} {value === 1 ? "dia" : "dias"}
        <span className="sr-only">
          {" "}
          de ofensiva
          {freezes > 0
            ? `, ${freezes} ${freezes === 1 ? "congelamento guardado" : "congelamentos guardados"}`
            : ""}
        </span>
        {freezes > 0 && (
          <span aria-hidden className="text-ink-muted inline-flex items-center gap-0.5">
            <Snowflake size={14} strokeWidth={2.4} />
            {freezes}
          </span>
        )}
      </span>
    );
  }
  if (kind === "xp") {
    return (
      <span className="bg-surface-300 text-small text-ink inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-extrabold">
        <Star
          size={16}
          aria-hidden
          className="text-reward-mark"
          fill="currentColor"
          strokeWidth={0}
        />
        {value.toLocaleString("pt-BR")} XP
      </span>
    );
  }
  return (
    <span className="bg-surface-300 text-small text-ink inline-flex h-8 items-center rounded-full px-3 font-extrabold">
      Nível {value}
    </span>
  );
}
