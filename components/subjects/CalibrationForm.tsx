"use client";

import { useActionState, useEffect, useState } from "react";
import { recordCalibration, type FormState } from "@/app/(app)/disciplinas/actions";
import { FormMessage, SubmitButton, TextField } from "@/components/forms/fields";
import { elapsedSeconds, formatClock } from "@/lib/calibration";

type Mode = "stopwatch" | "manual";
type Watch =
  | { status: "idle" }
  | { status: "running"; startedAt: number }
  | { status: "stopped"; seconds: number };

/** Mini cronômetro baseado em timestamps: o tempo continua certo com a aba oculta. */
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

export function CalibrationForm({
  subjectId,
  hasGlobalPace,
}: {
  /** Vazio = calibrar o ritmo padrão (global). */
  subjectId: string | null;
  hasGlobalPace: boolean;
}) {
  const [state, dispatch] = useActionState<FormState, FormData>(recordCalibration, {});
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [watch, setWatch] = useState<Watch>({ status: "idle" });
  const now = useNow(watch.status === "running");

  const seconds =
    watch.status === "running"
      ? elapsedSeconds(watch.startedAt, now)
      : watch.status === "stopped"
        ? watch.seconds
        : 0;

  const tabClass = (active: boolean) =>
    `flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold has-focus-visible:outline-3 has-focus-visible:outline-ring ${
      active ? "bg-surface text-foreground shadow-sm" : "text-muted"
    }`;

  return (
    <form action={dispatch} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="source" value={mode} />
      <input type="hidden" name="subjectId" value={subjectId ?? ""} />

      <fieldset className="bg-border/50 flex gap-1 rounded-xl p-1">
        <legend className="sr-only">Como calibrar</legend>
        {(
          [
            ["stopwatch", "Com cronômetro"],
            ["manual", "Já sei meu ritmo"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className={tabClass(mode === value)}>
            <input
              type="radio"
              name="modo"
              value={value}
              checked={mode === value}
              onChange={() => setMode(value)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </fieldset>

      {mode === "stopwatch" ? (
        <div className="flex flex-col gap-4">
          <ol className="text-muted list-decimal pl-5 text-sm">
            <li>Abra o livro e toque em Iniciar.</li>
            <li>Leia uma ou mais páginas no seu ritmo normal.</li>
            <li>Toque em Parar e conte quantas páginas leu.</li>
          </ol>

          <div className="border-border bg-surface flex flex-col items-center gap-4 rounded-xl border p-6">
            <p
              className="font-mono text-5xl font-semibold tabular-nums"
              aria-live={watch.status === "running" ? "off" : "polite"}
              aria-label={`Tempo: ${formatClock(seconds)}`}
            >
              {formatClock(seconds)}
            </p>
            <input type="hidden" name="seconds" value={watch.status === "stopped" ? seconds : ""} />
            <div className="flex gap-2">
              {watch.status === "idle" && (
                <button
                  type="button"
                  onClick={() => setWatch({ status: "running", startedAt: Date.now() })}
                  className="bg-primary text-primary-foreground min-h-11 rounded-lg px-6 font-semibold"
                >
                  Iniciar
                </button>
              )}
              {watch.status === "running" && (
                <button
                  type="button"
                  onClick={() =>
                    setWatch({
                      status: "stopped",
                      seconds: elapsedSeconds(watch.startedAt, Date.now()),
                    })
                  }
                  className="bg-foreground text-background min-h-11 rounded-lg px-6 font-semibold"
                >
                  Parar
                </button>
              )}
              {watch.status === "stopped" && (
                <button
                  type="button"
                  onClick={() => setWatch({ status: "idle" })}
                  className="border-border min-h-11 rounded-lg border px-6 font-semibold"
                >
                  Medir de novo
                </button>
              )}
            </div>
          </div>

          {watch.status === "stopped" && (
            <TextField
              name="pages"
              label="Quantas páginas você leu?"
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              required
              autoFocus
            />
          )}
        </div>
      ) : (
        <TextField
          name="minutesPerPage"
          label="Quantos minutos você leva por página?"
          inputMode="decimal"
          placeholder="Ex.: 2,5"
          required
          hint="Pode usar vírgula: 1,5 significa um minuto e meio."
        />
      )}

      {subjectId && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="setDefault"
            value="sim"
            defaultChecked={!hasGlobalPace}
            className="accent-primary size-5"
          />
          <span className="text-sm">Usar também como meu ritmo padrão para novas disciplinas</span>
        </label>
      )}

      <FormMessage message={state.error} />
      <SubmitButton pendingText="Salvando…">Salvar ritmo</SubmitButton>
    </form>
  );
}
