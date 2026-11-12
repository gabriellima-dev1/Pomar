"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionFormState } from "@/components/forms/ActionForm";
import { requireUser } from "@/lib/auth/session";
import {
  normalizeUsernameInput,
  USERNAME_PROBLEM_TEXT,
  usernameProblem,
} from "@/lib/league/username";
import { createClient } from "@/lib/supabase/server";

/** Para onde voltar depois de salvar o apelido (só rotas internas conhecidas). */
function safeReturn(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return ["/liga", "/liga?aba=amigos", "/configuracoes"].includes(v) ? v : "/liga";
}

export type UsernameStatus = "disponivel" | "em_uso" | "invalido";

/** Validação ao digitar (telas.md › 24): formato + disponibilidade no servidor. */
export async function checkUsername(raw: string): Promise<UsernameStatus> {
  await requireUser();
  const value = normalizeUsernameInput(raw);
  if (usernameProblem(value)) return "invalido";
  const supabase = await createClient();
  const { data } = await supabase.rpc("username_available", { p_username: value });
  return data ? "disponivel" : "em_uso";
}

/** "Salvar apelido" (tela 24 e Configurações): apelido + perfil público (desmarcado por padrão). */
export async function saveUsername(
  _prev: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const user = await requireUser();
  const value = normalizeUsernameInput(String(formData.get("apelido") ?? ""));
  const problem = usernameProblem(value);
  if (problem) return { error: `${USERNAME_PROBLEM_TEXT[problem]}.` };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ username: value, public_profile: formData.get("publico") === "on" })
    .eq("id", user.id);
  if (error?.code === "23505") return { error: "Esse apelido já está em uso. Tente outro." };
  if (error) return { error: "Não consegui salvar agora. Tente de novo." };

  revalidatePath("/liga");
  revalidatePath("/configuracoes");
  const back = safeReturn(formData.get("depois"));
  redirect(back === "/configuracoes" ? "/configuracoes?apelido=1" : back);
}

/** Tela 25: o resultado da semana aparece uma vez. */
export async function markWeekResultSeen(week: string): Promise<void> {
  const user = await requireUser();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) return;
  const supabase = await createClient();
  await supabase
    .from("league_members")
    .update({ result_seen_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("week_start", week);
}
