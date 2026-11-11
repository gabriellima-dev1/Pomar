import { formatTimer } from "@/lib/timer";

/**
 * Cronômetro em painel de vidro (Liquid Glass): translúcido com desfoque e fundo
 * opaco quando não há suporte ou com `prefers-reduced-transparency` (telas.md › 08).
 */
export function GlassTimer({
  label,
  seconds,
  srLabel,
}: {
  label: "Foco" | "Descanso" | "Pausado" | "Pronto";
  seconds: number;
  /** Texto para leitores de tela (o número muda a cada segundo e não é anunciado). */
  srLabel: string;
}) {
  return (
    <div className="glass-panel flex w-[270px] flex-col items-center gap-2 rounded-[28px] px-6 pt-[18px] pb-[22px]">
      <span className="text-caption rounded-full bg-[var(--scene-chip)] px-3 py-1 text-[var(--scene-on-chip)]">
        {label}
      </span>
      <div
        role="timer"
        aria-label={srLabel}
        className="font-display text-[64px] leading-none font-semibold tracking-[-1px] text-[var(--scene-ink)] tabular-nums"
      >
        {formatTimer(seconds)}
      </div>
    </div>
  );
}
