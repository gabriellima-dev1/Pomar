import type { ReactNode } from "react";
import type { ThemeConfig } from "@/themes";
import { formatTimer, LONG_BREAK_EVERY } from "@/lib/timer";

/** Rótulo da barra por fruto do tema (telas.md › Pomodoro no computador). */
const RIPENING: Record<ThemeConfig["fruit"], string> = {
  tomate: "Fruto amadurecendo",
  abobora: "Abóbora amadurecendo",
  enfeite: "Enfeite ganhando cor",
};

/**
 * Painel do pomodoro no computador (≥ 1024px): GlassTimer e controles juntos, num
 * vidro de 440px à esquerda (referencias/35-pomodoro-desktop-*.png). Cores `--pc-*`
 * por tema, com contraste AA conferido em lib/design/contrast.test.ts.
 */
export function DesktopPanel({
  chip,
  seconds,
  srLabel,
  cyclesDone,
  currentCycle,
  showRipening,
  ripening,
  fruit,
  subjectTitle,
  topicTitle,
  topicDetail,
  children,
}: {
  chip: "Foco" | "Pausa" | "Descanso";
  seconds: number;
  /** Texto para leitores de tela (o número muda a cada segundo e não é anunciado). */
  srLabel: string;
  /** Bolinhas cheias (ciclos concluídos antes do descanso longo). */
  cyclesDone: number;
  /** Ciclo em andamento (1–4) ou `null` no descanso. */
  currentCycle: number | null;
  /** Barra do fruto (só no foco). */
  showRipening: boolean;
  /** 0–1, o mesmo progresso que amadurece o fruto na cena. */
  ripening: number;
  fruit: ThemeConfig["fruit"];
  subjectTitle: string | null;
  topicTitle: string | null;
  topicDetail: string | null;
  /** PomodoroControls (variant="panel"). */
  children: ReactNode;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, ripening)) * 100);
  const cycleNumber = currentCycle ?? cyclesDone;
  return (
    <section
      aria-label="Pomodoro"
      className="pc-glass flex w-[440px] flex-col gap-3.5 rounded-[32px] px-[30px] pt-6 pb-[26px] text-[var(--pc-ink)] shadow-[0_16px_40px_var(--pc-shade)]"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[var(--pc-chip)] px-3 py-1 text-xs font-extrabold tracking-[0.6px] text-[var(--pc-on-chip)] uppercase">
          {chip}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold">
          {Array.from({ length: LONG_BREAK_EVERY }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className={`size-[9px] rounded-full ${
                i < cyclesDone
                  ? "bg-[var(--pc-dot-done)]"
                  : currentCycle !== null && i === cyclesDone
                    ? "bg-[var(--pc-dot-now)]"
                    : "bg-[var(--pc-dot-off)]"
              }`}
            />
          ))}
          <span className="ml-1">
            Ciclo {Math.max(1, cycleNumber)} de {LONG_BREAK_EVERY}
          </span>
        </span>
      </div>

      <div
        role="timer"
        aria-label={srLabel}
        className="font-display text-[112px] leading-[0.95] font-semibold tracking-[-2px] tabular-nums"
      >
        {formatTimer(seconds)}
      </div>

      {showRipening && (
        <div className="flex flex-col gap-[5px]">
          <div
            role="progressbar"
            aria-label={RIPENING[fruit]}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="h-2 overflow-hidden rounded-full bg-[var(--pc-track)]"
          >
            <div className="h-full rounded-full bg-[var(--pc-bar)]" style={{ width: `${pct}%` }} />
          </div>
          <span aria-hidden className="text-xs font-extrabold">
            {RIPENING[fruit]} · {pct}%
          </span>
        </div>
      )}

      <div className="flex flex-col gap-px rounded-[18px] bg-[var(--pc-topic-bg)] px-3.5 py-3">
        <span className="text-xs font-extrabold text-[var(--pc-muted)] uppercase">
          {subjectTitle ?? "Sessão livre"}
        </span>
        {topicTitle && (
          <span className="text-[17px] font-extrabold text-[var(--pc-topic-ink)]">
            {topicTitle}
          </span>
        )}
        {topicDetail && (
          <span className="text-[13px] font-semibold text-[var(--pc-muted)]">{topicDetail}</span>
        )}
      </div>

      {children}
    </section>
  );
}
