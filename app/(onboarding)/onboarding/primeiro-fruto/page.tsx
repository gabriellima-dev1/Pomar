import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/forms/fields";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { Scene } from "@/components/scenes/Scene";
import { getAccount, latestSubjectId } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { ONBOARDING_LINES } from "@/lib/mascot/lines";
import { pathForStep } from "@/lib/onboarding";
import { finishOnboarding } from "../actions";

export const metadata: Metadata = { title: "Primeiro fruto" };

/**
 * Tela 20 · Primeiro fruto (referencias/20-primeiro-fruto.png): depois da folha de fim
 * do 1º pomodoro. "Ir para o meu pomar" encerra o onboarding.
 */
export default async function PrimeiroFrutoPage() {
  const user = await requireUser();
  const account = await getAccount(user.id);
  if (account.step !== "primeiro_fruto") {
    redirect(pathForStep(account.step, await latestSubjectId()));
  }

  return (
    <div
      data-theme="classico"
      className="relative flex min-h-dvh flex-1 flex-col overflow-hidden lg:min-h-[760px]"
    >
      <div aria-hidden className="absolute inset-0 bg-[var(--scene-sky-bottom)]" />
      <Scene theme="classico" stage="muda" progress={1} preserveAspectRatio="xMidYMax slice" />
      <div className="relative flex justify-center px-6 pt-14">
        <div className="glass-panel flex max-w-[300px] flex-col items-center gap-2 rounded-[28px] px-6 py-6 text-center">
          <h1 className="font-display text-[40px] leading-[44px] font-semibold text-[var(--scene-ink)]">
            Primeiro fruto colhido!
          </h1>
          <p className="font-extrabold text-[var(--scene-ink)]">
            {account.rewards ? ONBOARDING_LINES.firstFruit : "Seu pomar começou."}
          </p>
        </div>
      </div>
      <section
        aria-labelledby="prontinho"
        className="bg-surface-200 text-ink shadow-dialog relative mt-auto flex flex-col gap-4 rounded-t-lg px-4 pt-6 pb-6"
      >
        <div className="flex items-center gap-4">
          <SeuTomas size={64} className="shrink-0" />
          <h2 id="prontinho" className="text-title">
            Prontinho{account.name ? `, ${account.name}` : ""}!
          </h2>
        </div>
        <p className="text-ink-muted text-lg">
          {/* Coorte B (DESIGN §9.4): sem emblemas e colheitas visíveis. */}
          {account.rewards
            ? "Volte amanhã para descobrir qual fruto do dia saiu. Cada dia com estudo conta para a colheita da semana."
            : "Cada pomodoro vira um fruto no seu pomar. Volte quando quiser para colher o próximo."}
        </p>
        <form action={finishOnboarding} className="flex flex-col">
          <SubmitButton size="lg" pendingText="Abrindo…">
            Ir para o meu pomar
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
