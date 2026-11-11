import type { ReactNode } from "react";

function clamp(percent: number): number {
  return Math.max(0, Math.min(100, Math.round(percent)));
}

/**
 * Anel de progresso. Trilho em `--surface-300`; a cor é por significado
 * (disciplina, XP, colheita) e chega como valor CSS (`var(--subject-tomate)`).
 */
export function ProgressRing({
  percent,
  color,
  size = 56,
  stroke,
  label,
  children,
}: {
  percent: number;
  color: string;
  size?: number;
  stroke?: number;
  /** Texto para leitores de tela. Sem ele, o anel é decorativo. */
  label?: string;
  /** Conteúdo no centro (padrão: a porcentagem). */
  children?: ReactNode;
}) {
  const value = clamp(percent);
  const width = stroke ?? Math.max(6, Math.round(size / 9));
  const r = (size - width) / 2;
  const circumference = 2 * Math.PI * r;
  const a11y = label
    ? {
        role: "progressbar" as const,
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": value,
        "aria-valuetext": `${value}%`,
      }
    : { "aria-hidden": true };

  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      {...a11y}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-300)"
          strokeWidth={width}
        />
        {value > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
            className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
          />
        )}
      </svg>
      <span className="absolute inset-0 grid place-items-center font-extrabold" aria-hidden>
        {children ?? `${value}%`}
      </span>
    </div>
  );
}

export function ProgressBar({
  percent,
  color,
  label,
}: {
  percent: number;
  color: string;
  label: string;
}) {
  const value = clamp(percent);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
      className="bg-surface-300 h-2.5 w-full overflow-hidden rounded-full"
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}
