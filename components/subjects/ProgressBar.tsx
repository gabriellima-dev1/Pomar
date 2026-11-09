import { colorHex } from "@/lib/subjects/colors";

export function ProgressBar({
  percent,
  color,
  label,
}: {
  percent: number;
  color: string;
  /** Texto para leitores de tela, ex.: "Progresso de Algoritmos". */
  label: string;
}) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
      className="bg-border h-2.5 w-full overflow-hidden rounded-full"
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${value}%`, backgroundColor: colorHex(color) }}
      />
    </div>
  );
}
