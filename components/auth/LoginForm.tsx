"use client";

import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/(public)/auth-actions";
import { FormMessage, SubmitButton, TextField } from "./fields";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(login, {
    error: initialError,
  });

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FormMessage message={state.error} />
      <TextField
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <TextField
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <SubmitButton pendingText="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
