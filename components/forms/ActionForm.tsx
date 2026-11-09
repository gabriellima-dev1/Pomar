"use client";

import { useActionState, type ReactNode } from "react";
import { FormMessage } from "./fields";

export type ActionFormState = { error?: string; ok?: boolean };

/**
 * Formulário pequeno ligado a uma Server Action com estado (mostra o erro).
 * Os campos (children) podem vir de um Server Component.
 */
export function ActionForm({
  action,
  children,
  className,
  label,
}: {
  action: (prev: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  children: ReactNode;
  className?: string;
  /** Nome acessível do formulário. */
  label?: string;
}) {
  const [state, dispatch] = useActionState(action, {});
  return (
    <form action={dispatch} className={className} aria-label={label} noValidate>
      {children}
      {state.error && (
        <div className="col-span-full basis-full">
          <FormMessage message={state.error} />
        </div>
      )}
    </form>
  );
}
