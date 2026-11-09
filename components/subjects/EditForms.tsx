"use client";

import { useActionState, useState, type ReactNode } from "react";
import { deleteSubject, updateSubject, type FormState } from "@/app/(app)/disciplinas/actions";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { SubjectFieldsInputs, type SubjectFieldValues } from "./SubjectFieldsInputs";

export function SubjectEditForm({
  subjectId,
  values,
}: {
  subjectId: string;
  values: SubjectFieldValues;
}) {
  const [state, dispatch] = useActionState<FormState, FormData>(updateSubject, {});
  return (
    <form action={dispatch} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="subjectId" value={subjectId} />
      <SubjectFieldsInputs values={state.values ?? values} errors={state.fieldErrors} />
      <FormMessage message={state.error} />
      {state.ok && (
        <p role="status" className="text-sm">
          Alterações salvas.
        </p>
      )}
      <div>
        <SubmitButton pendingText="Salvando…">Salvar alterações</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteSubjectForm({ subjectId, title }: { subjectId: string; title: string }) {
  const [state, dispatch] = useActionState<FormState, FormData>(deleteSubject, {});
  const [confirmed, setConfirmed] = useState(false);
  return (
    <form action={dispatch} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="subjectId" value={subjectId} />
      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="confirmar"
          value="sim"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="accent-danger size-5"
        />
        <span className="text-sm">
          Entendo que <strong>{title}</strong> e todo o progresso dela serão apagados.
        </span>
      </label>
      <FormMessage message={state.error} />
      <button
        type="submit"
        disabled={!confirmed}
        className="bg-danger min-h-11 self-start rounded-lg px-4 font-semibold text-white disabled:opacity-50"
      >
        Excluir disciplina
      </button>
    </form>
  );
}

/** Botão de envio que pede confirmação antes (ex.: excluir capítulo). */
export function ConfirmSubmitButton({
  formAction,
  message,
  children,
  className,
}: {
  formAction: (formData: FormData) => Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
