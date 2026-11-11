"use client";

import { Minus, Plus } from "lucide-react";

const roundButton =
  "border-control-border bg-surface-100 text-ink inline-grid size-11 shrink-0 place-items-center rounded-full border-2 font-extrabold disabled:border-line disabled:text-ink-muted disabled:opacity-60";

/**
 * Contador −/+ (páginas lidas). Valor em Fredoka tabular, botões redondos de 44px
 * que desabilitam no limite.
 */
export function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  hint,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-extrabold">{label}</span>
        {hint && <span className="text-small text-ink-muted">{hint}</span>}
      </div>
      <button
        type="button"
        className={roundButton}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Diminuir ${label.toLowerCase()}`}
      >
        <Minus size={20} aria-hidden />
      </button>
      <output
        aria-live="polite"
        aria-label={label}
        className="font-display min-w-10 text-center text-[32px] leading-none font-semibold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        className={roundButton}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar ${label.toLowerCase()}`}
      >
        <Plus size={20} aria-hidden />
      </button>
    </div>
  );
}

/** Ajuste de minutos em passos de 5, com limites (Ajustar ciclo, DESIGN §4.5). */
export function StepperButton({
  label,
  value,
  min,
  max,
  step = 5,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="border-line bg-surface-200 flex items-center gap-3 rounded-lg border-2 px-4 py-3">
      <button
        type="button"
        className={roundButton}
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={`${label}: menos ${step} minutos`}
      >
        −{step}
      </button>
      <div className="flex flex-1 flex-col items-center">
        <span className="text-caption text-ink-muted">{label}</span>
        <span aria-live="polite" className="flex items-baseline gap-1">
          <span className="font-display text-[32px] leading-9 font-semibold tabular-nums">
            {value}
          </span>
          <span className="text-small text-ink-muted">min</span>
        </span>
      </div>
      <button
        type="button"
        className={roundButton}
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={`${label}: mais ${step} minutos`}
      >
        +{step}
      </button>
    </div>
  );
}
