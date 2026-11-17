"use client";

import Link from "next/link";
import { Timer } from "lucide-react";
import { focusAriaLabel, type FocusStatus } from "@/lib/focus-status";
import { formatTimer } from "@/lib/timer";
import { useFocusStatus } from "./FocusStatusProvider";

/** Fruto maduro do estado "Colher" (39b). Só tokens: muda com o tema. */
export function RipeFruit({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="14" r="8.5" fill="var(--fruit)" />
      <ellipse cx="9" cy="11" rx="2" ry="1.3" fill="var(--illo-shine)" opacity="0.7" />
      <path
        d="M12 6.2c0-1.6.6-2.8 1.8-3.6M12 6.2c-1.6-.9-3.2-.8-4.4.2 1.3.8 2.8 1 4.4-.2Z"
        fill="var(--primary)"
        stroke="var(--primary)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

/** Anel do círculo do celular: progresso do ciclo (rodando) ou cheio (pausado, colher). */
function Ring({ status }: { status: FocusStatus }) {
  if (status.kind === "idle") return null;
  const track =
    status.kind === "running"
      ? "var(--primary-strong)"
      : status.kind === "paused"
        ? "var(--line)"
        : "var(--fruit-soft)";
  const stroke =
    status.kind === "running"
      ? "var(--reward)"
      : status.kind === "paused"
        ? "var(--control-border)"
        : "var(--fruit)";
  const progress = status.kind === "running" ? status.progress : 1;
  return (
    <svg viewBox="0 0 50 50" className="absolute inset-0 size-full -rotate-90" aria-hidden>
      <circle cx="25" cy="25" r={RING_R} fill="none" stroke={track} strokeWidth="3" />
      <circle
        cx="25"
        cy="25"
        r={RING_R}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={RING_C * (1 - Math.min(1, Math.max(0, progress)))}
      />
    </svg>
  );
}

const CIRCLE: Record<FocusStatus["kind"], string> = {
  idle: "bg-primary text-on-primary shadow-[0_4px_0_var(--primary-strong)]",
  running: "bg-primary text-on-primary shadow-[0_4px_0_var(--primary-strong)]",
  paused: "bg-surface-200 text-primary-strong shadow-[0_4px_0_var(--line)]",
  harvest: "bg-fruit-soft shadow-[0_4px_0_var(--fruit)]",
};

/**
 * Item Foco da barra do celular (39): círculo de 58px no centro, 22px acima da barra.
 * Rodando: tempo e anel em `--reward`; pausado: círculo claro e "Pausado"; foco
 * terminado fora do Foco: fruto maduro e "Colher" (39b).
 */
export function FocusTab() {
  const status = useFocusStatus();
  const label =
    status.kind === "paused" ? "Pausado" : status.kind === "harvest" ? "Colher" : "Foco";
  return (
    <Link
      href="/pomodoro"
      aria-label={focusAriaLabel(status)}
      data-estado={status.kind}
      className="relative flex min-h-14 flex-col items-center justify-end rounded-md pb-0.5"
    >
      <span
        className={`border-surface-200 absolute -top-7 left-1/2 grid size-[58px] -translate-x-1/2 place-items-center rounded-full border-4 ${CIRCLE[status.kind]}`}
      >
        <Ring status={status} />
        {status.kind === "idle" && <Timer size={26} aria-hidden strokeWidth={2.25} />}
        {(status.kind === "running" || status.kind === "paused") && (
          <span className="relative text-[13px] leading-none font-extrabold tabular-nums">
            {formatTimer(status.remainingSec)}
          </span>
        )}
        {status.kind === "harvest" && <RipeFruit size={24} />}
      </span>
      <span
        className={`text-[13px] leading-4 font-extrabold ${
          status.kind === "harvest"
            ? "text-fruit"
            : status.kind === "paused"
              ? "text-ink-muted"
              : "text-primary"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

/** Selo do item Foco na barra lateral (39, 39b): tempo, "Pausado" ou "Colher". */
export function FocusSideBadge({ status }: { status: FocusStatus }) {
  if (status.kind === "idle") return null;
  if (status.kind === "paused") {
    return (
      <span className="bg-surface-300 text-small text-ink-muted ml-auto rounded-full px-2.5 py-0.5 font-extrabold">
        Pausado
      </span>
    );
  }
  return (
    <span className="bg-fruit-soft text-small text-ink ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-extrabold tabular-nums">
      {status.kind === "running" ? (
        <>
          <span aria-hidden className="bg-fruit size-2 rounded-full" />
          {formatTimer(status.remainingSec)}
        </>
      ) : (
        <>
          <RipeFruit size={18} />
          Colher
        </>
      )}
    </span>
  );
}
