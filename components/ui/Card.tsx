import type { HTMLAttributes } from "react";

/** Card do design system: fundo `--surface-200`, contorno `--line`, sombra curta sólida. */
export const cardClasses = "bg-surface-200 border-line shadow-card rounded-lg border-2";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardClasses} p-4 ${className}`} {...rest} />;
}
