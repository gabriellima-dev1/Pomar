"use client";

import { useActionState } from "react";
import { recordCalibration, type FormState } from "@/app/(app)/disciplinas/actions";
import { SubmitButton } from "@/components/forms/fields";
import { Checkbox } from "@/components/ui/Checkbox";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { StickyFooter } from "@/components/ui/StickyFooter";
import { CalibrationFields } from "./CalibrationFields";

/** Calibrar o ritmo de uma disciplina ou o ritmo padrão (referencias/04-calibrar-ritmo.png). */
export function CalibrationForm({
  subjectId,
  hasGlobalPace,
}: {
  /** `null` = calibrar o ritmo padrão (global). */
  subjectId: string | null;
  hasGlobalPace: boolean;
}) {
  const [state, dispatch] = useActionState<FormState, FormData>(recordCalibration, {});

  return (
    <form action={dispatch} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="subjectId" value={subjectId ?? ""} />
      <MascotBubble>
        Abra o livro, aperte o play e leia normalmente. Com isso eu estimo quanto falta para
        terminar.
      </MascotBubble>

      <CalibrationFields error={state.error} />

      {subjectId && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <Checkbox name="setDefault" value="sim" defaultChecked={!hasGlobalPace} />
          <span className="text-small">
            Usar também como meu ritmo padrão para novas disciplinas
          </span>
        </label>
      )}

      <StickyFooter>
        <SubmitButton pendingText="Salvando…" size="lg">
          Salvar ritmo
        </SubmitButton>
      </StickyFooter>
    </form>
  );
}
