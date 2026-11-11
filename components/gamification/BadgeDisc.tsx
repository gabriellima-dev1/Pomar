import { Lock } from "lucide-react";
import type { BadgeCode, Rarity } from "@/lib/gamification/catalog";
import { BadgeIcon } from "./BadgeIcon";

/**
 * Disco do emblema no estilo da raridade (docs/design/telas.md › Raridade dos emblemas).
 * A raridade sempre vai escrita ao lado (nunca só pela cor).
 */
export function BadgeDisc({
  code,
  rarity,
  state = "obtained",
  size = 48,
}: {
  code: BadgeCode;
  rarity: Rarity;
  /** `missing` = ainda não obtido; `secret` = oculto não obtido (cadeado, sem ícone). */
  state?: "obtained" | "missing" | "secret";
  size?: number;
}) {
  const icon = Math.round(size * 0.5);
  let cls = "";
  let style: React.CSSProperties | undefined;
  if (state !== "obtained") {
    cls = "bg-surface-300 text-control-border";
  } else if (rarity === "comum") {
    cls = "bg-reward text-on-reward";
  } else if (rarity === "incomum") {
    cls = "bg-primary-soft text-primary-strong border-primary";
    style = { borderWidth: Math.max(2, Math.round(size / 24)) };
  } else {
    cls = "bg-fruit text-on-fruit";
    style = { boxShadow: "0 0 0 3px var(--surface-200), 0 0 0 6px var(--reward)" };
  }
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full ${cls}`}
      style={{ width: size, height: size, ...style }}
    >
      {state === "secret" ? (
        <Lock size={Math.round(size * 0.4)} strokeWidth={2} />
      ) : (
        <BadgeIcon code={code} size={icon} />
      )}
    </span>
  );
}
