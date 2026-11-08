"use client";

import { useActionState } from "react";
import { signup, type AuthFormState } from "@/app/(public)/auth-actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/validation";
import { FormMessage, SubmitButton, TextField } from "./fields";
import { useBrowserContext } from "./useBrowserContext";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signup, {});
  const { timezone, anonId } = useBrowserContext();

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="anonId" value={anonId} />
      <FormMessage message={state.error} />
      <TextField
        name="displayName"
        label="Como podemos te chamar?"
        autoComplete="nickname"
        maxLength={60}
        required
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
      />
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
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
        hint={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`}
        error={state.fieldErrors?.password}
      />
      <SubmitButton pendingText="Criando sua conta…">Criar conta</SubmitButton>
    </form>
  );
}
