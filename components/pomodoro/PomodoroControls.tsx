"use client";

import { BellRing } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { TimerStatus } from "@/lib/timer";

/**
 * Convite de notificação, erro e botões do pomodoro, por estado. Os mesmos nos dois
 * layouts: `sheet` = folha do celular (referencias/08), `panel` = painel do computador
 * (referencias/35, com as cores `--pc-*` e os atalhos nos `aria-keyshortcuts`).
 */
export function PomodoroControls({
  variant,
  isFocus,
  status,
  pauseDialogOpen,
  busy,
  error,
  askNotif,
  onStart,
  onPause,
  onEnd,
  onResume,
  onRetry,
  onSkipBreak,
  onAllowNotifications,
  onDismissNotifications,
}: {
  variant: "sheet" | "panel";
  isFocus: boolean;
  status: TimerStatus;
  pauseDialogOpen: boolean;
  busy: boolean;
  error: string | null;
  askNotif: boolean;
  onStart: () => void;
  onPause: () => void;
  onEnd: () => void;
  onResume: () => void;
  onRetry: () => void;
  onSkipBreak: () => void;
  onAllowNotifications: () => void;
  onDismissNotifications: () => void;
}) {
  const panel = variant === "panel";
  return (
    <>
      {askNotif && isFocus && status === "running" && (
        <div
          className={`flex w-full items-start gap-3 rounded-md p-3 ${
            panel ? "bg-[var(--pc-topic-bg)] text-[var(--pc-topic-ink)]" : "bg-[var(--surface-200)]"
          }`}
        >
          <BellRing
            size={20}
            aria-hidden
            className={`mt-0.5 shrink-0 ${panel ? "" : "text-[var(--scene-sheet-action)]"}`}
          />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-small">
              Quer que eu avise quando o ciclo terminar, mesmo em outra aba?
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={onAllowNotifications}>
                Avisar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismissNotifications}
                className={panel ? "text-[var(--pc-end-ink)]" : ""}
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-small w-full rounded-md bg-[var(--fruit-soft)] px-3 py-2 text-[var(--ink)]"
        >
          {error}
        </p>
      )}

      <div className={`flex w-full ${panel ? "gap-2.5" : "gap-2"}`}>
        {isFocus && status === "ready" && (
          <Button size="lg" className="flex-1" onClick={onStart} disabled={busy}>
            {busy ? "Começando…" : "Começar foco"}
          </Button>
        )}
        {isFocus && status === "running" && (
          <>
            <ControlButton variant={variant} kind="secondary" onClick={onPause} keys="Space">
              Pausar
            </ControlButton>
            <ControlButton variant={variant} kind="ghost" onClick={onEnd}>
              Encerrar
            </ControlButton>
          </>
        )}
        {isFocus && status === "paused" && !pauseDialogOpen && (
          <>
            <Button
              size="lg"
              className="flex-1"
              onClick={onResume}
              aria-keyshortcuts={panel ? "Space" : undefined}
            >
              Continuar
            </Button>
            <ControlButton variant={variant} kind="ghost" onClick={onEnd}>
              Encerrar
            </ControlButton>
          </>
        )}
        {isFocus && status === "finished" && error && (
          <Button size="lg" className="flex-1" onClick={onRetry}>
            Tentar de novo
          </Button>
        )}
        {!isFocus && (
          <ControlButton variant={variant} kind="secondary" onClick={onSkipBreak}>
            Pular descanso
          </ControlButton>
        )}
      </div>
    </>
  );
}

/** Botões secundário e fantasma com as cores da cena (folha) ou do painel. */
function ControlButton({
  variant,
  kind,
  onClick,
  keys,
  children,
}: {
  variant: "sheet" | "panel";
  kind: "secondary" | "ghost";
  onClick: () => void;
  /** Atalho anunciado (só no painel do computador, onde ele existe). */
  keys?: string;
  children: ReactNode;
}) {
  if (variant === "panel") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-keyshortcuts={keys}
        className={`min-h-[52px] flex-1 rounded-[22px] text-[17px] font-extrabold ${
          kind === "secondary"
            ? "border-2 border-[var(--pc-pause-border)] bg-[var(--pc-pause-bg)] text-[var(--pc-pause-ink)]"
            : "text-[var(--pc-end-ink)]"
        }`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-md font-extrabold text-[var(--scene-sheet-action)] ${
        kind === "secondary"
          ? "flex-1 border-2 border-[var(--scene-sheet-border)] bg-[var(--surface-200)]"
          : "px-5"
      }`}
    >
      {children}
    </button>
  );
}
