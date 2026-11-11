"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { StepperButton } from "@/components/ui/Stepper";
import { LIMITS } from "@/lib/timer";

export type CycleSettings = { focus: number; shortBreak: number; longBreak: number };

/** Ajustar ciclo (referencias/05-ajustar-ciclo.png): −5/+5 com os limites do §4.5. */
export function CycleSettingsDialog({
  open,
  initial,
  sound,
  saving,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: CycleSettings;
  sound: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (settings: CycleSettings, sound: boolean) => void;
}) {
  const [values, setValues] = useState(initial);
  const [soundOn, setSoundOn] = useState(sound);

  return (
    <Dialog open={open} onClose={onClose} labelledBy="ciclo-titulo">
      <div className="flex flex-col gap-4">
        <h2 id="ciclo-titulo" className="text-title">
          Ajustar ciclo
        </h2>
        <StepperButton
          label="Foco"
          value={values.focus}
          min={LIMITS.focus.min}
          max={LIMITS.focus.max}
          onChange={(focus) => setValues((v) => ({ ...v, focus }))}
        />
        <StepperButton
          label="Descanso"
          value={values.shortBreak}
          min={LIMITS.short_break.min}
          max={LIMITS.short_break.max}
          onChange={(shortBreak) => setValues((v) => ({ ...v, shortBreak }))}
        />
        <StepperButton
          label="Descanso longo · a cada 4"
          value={values.longBreak}
          min={LIMITS.long_break.min}
          max={LIMITS.long_break.max}
          onChange={(longBreak) => setValues((v) => ({ ...v, longBreak }))}
        />
        <p className="text-small text-ink-muted text-center">
          Foco de 15 a 60 min · descanso de 5 a 30 · longo de 10 a 30
        </p>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
          <span className="font-extrabold">Tocar som ao terminar</span>
          <Checkbox checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} />
        </label>
        {error && (
          <p role="alert" className="text-small text-danger">
            {error}
          </p>
        )}
        <Button size="lg" onClick={() => onSave(values, soundOn)} disabled={saving}>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </Dialog>
  );
}
