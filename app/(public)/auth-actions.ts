"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth/errors";
import { originFromHeaders } from "@/lib/auth/origin";
import { safeNext } from "@/lib/auth/redirect";
import {
  hasErrors,
  parseLogin,
  parseSignup,
  validateLogin,
  validateSignup,
  type FieldErrors,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  fieldErrors?: FieldErrors<"displayName" | "email" | "password">;
  values?: { displayName?: string; email?: string };
};

function str(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.length > 0 ? value.slice(0, 64) : undefined;
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const input = parseLogin(formData);
  const fieldErrors = validateLogin(input);
  if (hasErrors(fieldErrors)) return { fieldErrors, values: { email: input.email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { error: authErrorMessage(error), values: { email: input.email } };

  redirect(safeNext(formData.get("next")));
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const input = parseSignup(formData);
  const values = { displayName: input.displayName, email: input.email };
  const fieldErrors = validateSignup(input);
  if (hasErrors(fieldErrors)) return { fieldErrors, values };

  const supabase = await createClient();
  const origin = originFromHeaders(await headers(), process.env.NEXT_PUBLIC_APP_URL);
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      // Lidos pelo trigger handle_new_user (perfil + signup_completed).
      data: {
        display_name: input.displayName,
        timezone: str(formData.get("timezone")),
        anon_id: str(formData.get("anonId")),
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: authErrorMessage(error), values };

  // Com "Confirm email" ligado no Supabase não há sessão: avisa em vez de falhar.
  if (!data.session) {
    return { error: "Conta criada! Confira seu e-mail para confirmar e depois entre.", values };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData.get("next"));
  const origin = originFromHeaders(await headers(), process.env.NEXT_PUBLIC_APP_URL);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?erro=google");
  redirect(data.url);
}
