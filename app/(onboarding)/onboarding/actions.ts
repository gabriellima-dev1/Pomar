"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { leaveCurrentGroup } from "@/lib/league/service";
import {
  QUESTION_COUNT,
  isBartleProfile,
  parseAnswers,
  scoreAnswers,
  type BartleProfile,
} from "@/lib/bartle";
import { pathForStep } from "@/lib/onboarding";
import { advanceOnboarding } from "@/lib/onboarding.server";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/telemetry.server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const GENERIC = "Não deu para salvar agora. Tente de novo.";

/** Tela 16 › "Vamos lá". */
export async function startOnboarding(): Promise<void> {
  const user = await requireUser();
  await advanceOnboarding(user.id, "boas_vindas", "quiz");
  redirect(pathForStep("quiz", null));
}

/**
 * Tela 17: guarda a resposta de uma pergunta (retoma de onde parou). Na última, o
 * servidor calcula o perfil e a distribuição (lib/bartle.ts) e registra
 * `onboarding_quiz_completed`.
 */
export async function saveQuizAnswer(
  index: number,
  profile: BartleProfile,
): Promise<ActionResult | { ok: true; done: true }> {
  const user = await requireUser();
  if (!Number.isInteger(index) || index < 0 || index >= QUESTION_COUNT) {
    return { ok: false, error: "Pergunta inválida." };
  }
  if (!isBartleProfile(profile)) return { ok: false, error: "Escolha uma das opções." };

  const supabase = await createClient();
  const account = await getAccount(user.id);
  const answers = parseAnswers(account.answers);
  answers[index] = profile;

  const complete = answers.every((a) => a !== null);
  const result = complete ? scoreAnswers(answers) : null;
  const { error } = await supabase
    .from("profiles")
    .update(
      result
        ? { bartle_answers: answers, bartle_primary: result.primary, bartle_scores: result.scores }
        : { bartle_answers: answers },
    )
    .eq("id", user.id);
  if (error) return { ok: false, error: GENERIC };
  if (!result) return { ok: true };

  await advanceOnboarding(user.id, "quiz", "perfil");
  await trackServer("onboarding_quiz_completed", {
    perfil: result.primary,
    ...result.scores,
    contexto: account.step === "concluido" ? "refazer" : "onboarding",
  });
  revalidatePath("/inicio");
  return { ok: true, done: true };
}

/** "Refazer o quiz" (tela 18 e Configurações): apaga as respostas e volta à 1ª pergunta. */
export async function redoQuiz(): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ bartle_answers: [] }).eq("id", user.id);
  redirect("/onboarding/quiz");
}

/**
 * "Continuar como {perfil}" ou "Escolher outro perfil" (tela 18 e Configurações). No
 * onboarding, segue para a Feira; fora dele, volta para onde a pessoa estava.
 */
export async function chooseProfile(formData: FormData): Promise<void> {
  const user = await requireUser();
  const profile = formData.get("perfil");
  if (!isBartleProfile(profile)) redirect("/onboarding/perfil");
  const supabase = await createClient();
  await supabase.from("profiles").update({ bartle_primary: profile }).eq("id", user.id);
  revalidatePath("/inicio");
  revalidatePath("/configuracoes");
  if (await advanceOnboarding(user.id, "perfil", "feira")) redirect(pathForStep("feira", null));
  const { step } = await getAccount(user.id);
  redirect(step === "concluido" ? "/configuracoes?perfil=1" : pathForStep(step, null));
}

/**
 * Opt-in da Feira (tela 19, Configurações e convite do Início), sem pré-marcação
 * (DESIGN §6.6). Registra `league_opt_in_choice` {choice, contexto}.
 */
export async function setLeagueChoice(formData: FormData): Promise<void> {
  const user = await requireUser();
  const choice = formData.get("feira");
  const context = String(formData.get("contexto") ?? "onboarding");
  if (choice !== "in" && choice !== "out") redirect("/onboarding/feira");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ league_opt_in: choice === "in" })
    .eq("id", user.id);
  if (!error) {
    await trackServer("league_opt_in_choice", {
      choice,
      contexto: ["onboarding", "configuracoes", "inicio", "liga"].includes(context)
        ? context
        : "outro",
    });
    // Sair da Feira tira a pessoa do grupo da semana em andamento (DECISOES 11/11).
    if (choice === "out") {
      try {
        await leaveCurrentGroup(user.id);
      } catch (e) {
        console.error("[feira] sair do grupo", e);
      }
    }
  }
  revalidatePath("/inicio");
  revalidatePath("/configuracoes");
  revalidatePath("/liga");
  if (await advanceOnboarding(user.id, "feira", "disciplina")) {
    redirect(pathForStep("disciplina", null));
  }
  if (context === "configuracoes") redirect("/configuracoes?feira=1");
  if (context === "liga") redirect("/liga");
  redirect("/inicio");
}

/** Convite da Feira no Início (Competidor): "Agora não" esconde o card de vez. */
export async function dismissLeagueInvite(): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ league_invite_dismissed_at: new Date().toISOString() })
    .eq("id", user.id);
  revalidatePath("/inicio");
}

/** Tela 20 › "Ir para o meu pomar": encerra o onboarding. */
export async function finishOnboarding(): Promise<void> {
  const user = await requireUser();
  await advanceOnboarding(user.id, "primeiro_fruto", "concluido");
  revalidatePath("/inicio");
  redirect("/inicio");
}
