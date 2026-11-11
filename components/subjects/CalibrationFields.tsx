"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { TextField } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/Progress";
import { Counter } from "@/components/ui/Stepper";
import {
  IDLE_STOPWATCH,
  formatClock,
  pauseStopwatch,
  paceFromMeasurement,
  runStopwatch,
  stopStopwatch,
  stopwatchSeconds,
  type Stopwatch,
} from "@/lib/calibration";
import { formatPace } from "@/lib/estimates";

/** Re-renderiza enquanto o cronômetro corre; o tempo vem dos timestamps. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [active]);
  return now;
}

const STATUS_LABEL: Record<Stopwatch["status"], string> = {
  idle: "Pronto",
  running: "Lendo",
  paused: "Pausado",
  stopped: "Medido",
};

/**
 * Campos da calibração (referencias/04-calibrar-ritmo.png): mini cronômetro,
 * páginas lidas e resultado, ou o valor direto ("Prefiro informar direto").
 * Envia `source`, `seconds`, `pages` e `minutesPerPage` no formulário que o contém.
 */
export function CalibrationFields({ error }: { error?: string }) {
  const [mode, setMode] = useState<"stopwatch" | "manual">("stopwatch");
  const [watch, setWatch] = useState<Stopwatch>(IDLE_STOPWATCH);
  const [pages, setPages] = useState(1);
  const now = useNow(watch.status === "running");
  const seconds = stopwatchSeconds(watch, now);
  const pace = seconds > 0 ? paceFromMeasurement(pages, seconds) : null;

  if (mode === "manual") {
    return (
      <div className="flex flex-col gap-4">
        <input type="hidden" name="source" value="manual" />
        <div className={`${cardClasses} p-4`}>
          <TextField
            name="minutesPerPage"
            label="Quantos minutos você leva por página?"
            inputMode="decimal"
            placeholder="Ex.: 2,5"
            required
            autoFocus
            hint="Pode usar vírgula: 1,5 é um minuto e meio."
            error={error}
          />
        </div>
        <button
          type="button"
          onClick={() => setMode("stopwatch")}
          className="text-primary min-h-11 self-center font-extrabold underline underline-offset-4"
        >
          Prefiro medir com o cronômetro
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="source" value="stopwatch" />
      <input type="hidden" name="seconds" value={seconds > 0 ? seconds : ""} />
      <input type="hidden" name="pages" value={pages} />

      <div className={`${cardClasses} flex flex-col gap-5 p-4`}>
        <div className="flex justify-center pt-2">
          <ProgressRing
            percent={watch.status === "idle" ? 0 : ((seconds % 60) / 60) * 100}
            color="var(--primary)"
            size={168}
            stroke={12}
          >
            <span className="flex flex-col items-center">
              <span
                className="font-display text-[44px] leading-none font-semibold tabular-nums"
                role="timer"
                aria-live={watch.status === "running" ? "off" : "polite"}
                aria-label={`Tempo medido: ${formatClock(seconds)}`}
              >
                {formatClock(seconds)}
              </span>
              <span className="text-caption text-ink-muted mt-2">{STATUS_LABEL[watch.status]}</span>
            </span>
          </ProgressRing>
        </div>

        <div className="flex gap-3">
          {watch.status === "idle" && (
            <Button className="flex-1" onClick={() => setWatch((w) => runStopwatch(w, Date.now()))}>
              <Play size={18} aria-hidden fill="currentColor" strokeWidth={0} />
              Começar
            </Button>
          )}
          {(watch.status === "running" || watch.status === "paused") && (
            <>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  setWatch((w) =>
                    w.status === "running"
                      ? pauseStopwatch(w, Date.now())
                      : runStopwatch(w, Date.now()),
                  )
                }
              >
                {watch.status === "running" ? "Pausar" : "Continuar"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => setWatch((w) => stopStopwatch(w, Date.now()))}
              >
                Parar
              </Button>
            </>
          )}
          {watch.status === "stopped" && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setWatch(runStopwatch(IDLE_STOPWATCH, Date.now()))}
            >
              Medir de novo
            </Button>
          )}
        </div>

        <div className="border-line border-t-2 pt-4">
          <Counter label="Páginas lidas" value={pages} onChange={setPages} min={1} max={500} />
        </div>

        <p
          aria-live="polite"
          className="bg-primary-soft text-primary-strong rounded-md px-4 py-3 text-center font-extrabold"
        >
          {pace !== null ? `≈ ${formatPace(pace)} por página` : "Aperte Começar e leia normalmente"}
        </p>
        {error && (
          <p role="alert" className="text-small text-danger">
            {error}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setMode("manual")}
        className="text-primary min-h-11 self-center font-extrabold underline underline-offset-4"
      >
        Prefiro informar direto
      </button>
    </div>
  );
}
