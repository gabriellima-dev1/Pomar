import type { Metadata } from "next";
import { Quiz } from "@/components/onboarding/Quiz";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Seu jeito de estudar" };

/** Tela 17 · Quiz de Bartle. Também serve para "Refazer o quiz" depois do onboarding. */
export default async function QuizPage() {
  const user = await requireUser();
  const account = await getAccount(user.id);
  const exitHref = account.step === "concluido" ? "/configuracoes" : null;
  return <Quiz initialAnswers={account.answers} seed={user.id} exitHref={exitHref} />;
}
