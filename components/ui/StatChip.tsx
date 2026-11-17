import { CircleCheck, Flame, Snowflake, Star } from "lucide-react";

/** Pílula de 32px: ofensiva, XP ou nível (docs/design/telas.md › StatChip). */
export function StatChip({
  kind,
  value,
  freezes = 0,
  muted = false,
}: {
  kind: "ofensiva" | "xp" | "nivel" | "topicos" | "capitulos";
  value: number;
  /** Congelamentos guardados (só na ofensiva; DESIGN §6.3). */
  freezes?: number;
  /** XP sem destaque (a partir do nível 10 o Início destaca a maestria, DESIGN §3). */
  muted?: boolean;
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
    if (muted) {
      return (
        <span className="text-small text-ink-muted inline-flex h-8 items-center px-1 font-semibold">
          {value.toLocaleString("pt-BR")} XP
        </span>
      );
    }
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
  if (kind === "topicos" || kind === "capitulos") {
    const unit =
      kind === "topicos"
        ? value === 1
          ? "tópico concluído"
          : "tópicos concluídos"
        : value === 1
          ? "capítulo concluído"
          : "capítulos concluídos";
    return (
      <span className="bg-primary-soft text-small text-ink inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-extrabold">
        <CircleCheck size={16} aria-hidden className="text-primary" strokeWidth={2.6} />
        {value.toLocaleString("pt-BR")} {unit}
      </span>
    );
  }
  return (
    <span className="bg-surface-300 text-small text-ink inline-flex h-8 items-center rounded-full px-3 font-extrabold">
      Nível {value}
    </span>
  );
}
