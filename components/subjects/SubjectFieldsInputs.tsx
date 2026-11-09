"use client";

import { TextField } from "@/components/forms/fields";
import { SUBJECT_COLORS } from "@/lib/subjects/colors";
import type { FieldErrors } from "@/lib/subjects/validation";

export type SubjectFieldValues = {
  title?: string;
  color?: string;
  goalDate?: string | null;
  dailyGoal?: number | string | null;
};

/** Título, cor, data da prova e meta diária (campos comuns aos formulários de disciplina). */
export function SubjectFieldsInputs({
  values,
  errors,
}: {
  values: SubjectFieldValues;
  errors?: FieldErrors;
}) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        name="title"
        label="Nome da disciplina"
        required
        maxLength={120}
        defaultValue={values.title}
        error={errors?.title}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Cor</legend>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((c) => (
            <label
              key={c.key}
              className="has-checked:ring-foreground has-focus-visible:outline-ring relative flex size-11 cursor-pointer items-center justify-center rounded-full ring-2 ring-transparent ring-offset-2 has-focus-visible:outline-3 has-focus-visible:outline-offset-4"
              style={{ backgroundColor: c.hex }}
            >
              <input
                type="radio"
                name="color"
                value={c.key}
                defaultChecked={(values.color ?? SUBJECT_COLORS[0].key) === c.key}
                className="peer sr-only"
              />
              <span className="sr-only">{c.label}</span>
              <span aria-hidden className="hidden text-lg font-bold text-white peer-checked:block">
                ✓
              </span>
            </label>
          ))}
        </div>
        {errors?.color && <p className="text-danger text-sm">{errors.color}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="goalDate"
          label="Data da prova ou meta (opcional)"
          type="date"
          defaultValue={values.goalDate ?? ""}
          error={errors?.goalDate}
        />
        <TextField
          name="dailyGoal"
          label="Meta diária de pomodoros (opcional)"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          defaultValue={values.dailyGoal ?? ""}
          error={errors?.dailyGoal}
          hint="Quantos ciclos você quer fazer por dia."
        />
      </div>
    </div>
  );
}
