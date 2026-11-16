"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionFormState } from "@/components/forms/ActionForm";
import { requireUser } from "@/lib/auth/session";
import { deleteConfirmationMatches, normalizeDisplayName, NAME_MAX } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const GENERIC = "Não consegui salvar agora. Tente de novo.";

/** Nome (linha CONTA › Nome). */
export async function saveDisplayName(
  _prev: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const user = await requireUser();
  const name = normalizeDisplayName(String(formData.get("nome") ?? ""));
  if (!name) return { error: `Escreva um nome de 1 a ${NAME_MAX} letras.` };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);
  if (error) return { error: GENERIC };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Interruptor "Perfil público" (desligado por padrão; só com apelido). */
export async function setPublicProfile(on: boolean): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (on && !p?.username) return { ok: false, error: "Escolha um apelido antes." };
  const { error } = await supabase
    .from("profiles")
    .update({ public_profile: on })
    .eq("id", user.id);
  if (error) return { ok: false, error: GENERIC };
  revalidatePath("/configuracoes");
  revalidatePath("/liga");
  return { ok: true };
}

/** Pontos de onde dá para sair do experimento (Configurações e Transparência). */
function safeBack(value: FormDataEntryValue | null): string {
  return value === "/transparencia"
    ? "/transparencia?experimento=saiu"
    : "/configuracoes?experimento=saiu";
}

/**
 * "Sair do experimento" (DESIGN §9.4): a pessoa passa a ver todas as recompensas e sai
 * da comparação A × B. A gravação é da função `leave_experiment()` (só a própria linha).
 */
export async function leaveExperiment(formData: FormData): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_experiment");
  if (error) throw new Error("Não consegui tirar você do experimento agora.");
  revalidatePath("/", "layout");
  redirect(safeBack(formData.get("depois")));
}

/**
 * Excluir conta (tela 32): confere a confirmação no servidor, apaga a pessoa de
 * `auth.users` com a chave secreta (os dados caem em cascata; a telemetria fica sem
 * `user_id`) e volta para a landing com o aviso.
 */
export async function deleteAccount(
  _prev: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  const typed = String(formData.get("confirmacao") ?? "");
  if (!deleteConfirmationMatches(typed, p?.username ?? null)) {
    return { error: "O texto não confere. Digite exatamente o que aparece acima." };
  }
  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) return { error: "Não consegui excluir agora. Tente de novo em instantes." };
  // A sessão aponta para uma conta que não existe mais: limpa os cookies.
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  redirect("/?conta=excluida");
}
