import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { OnboardingActions, OnboardingBody } from "@/components/onboarding/Shell";
import { Scene } from "@/components/scenes/Scene";
import { SubmitButton } from "@/components/forms/fields";
import { cardClasses } from "@/components/ui/Card";
import { getAccount, latestSubjectId } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { VISIBLE_STEPS, pathForStep } from "@/lib/onboarding";
import { startOnboarding } from "./actions";

export const metadata: Metadata = { title: "Boas-vindas" };

/** Tela 16 · Boas-vindas (referencias/16-onboarding-boas-vindas.png). */
export default async function BoasVindasPage() {
  const user = await requireUser();
  const account = await getAccount(user.id);
  if (account.step !== "boas_vindas") redirect(pathForStep(account.step, await latestSubjectId()));

  return (
    <>
      <div data-theme="classico" className="relative h-[300px] shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--scene-sky-bottom)]" />
        <Scene
          theme="classico"
          still
          orchard={false}
          viewBox="0 230 390 340"
          preserveAspectRatio="xMidYMax slice"
        />
        <SeuTomas size={140} className="absolute bottom-6 left-1/2 -translate-x-1/2" />
      </div>
      <OnboardingBody className="pt-5">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-display">
            Oi{account.name ? `, ${account.name}` : ""}! Eu sou o Seu Tomás.
          </h1>
          <p className="text-ink-muted text-lg">
            Vou cuidar desse pomar junto com você. Antes do primeiro fruto, são só alguns passos:
          </p>
        </div>
        <ol className={`${cardClasses} flex flex-col gap-3 p-5`}>
          {VISIBLE_STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-4">
              <span
                aria-hidden
                className={`font-display grid size-11 shrink-0 place-items-center rounded-full text-lg font-semibold ${
                  i === 0 ? "bg-primary text-on-primary" : "bg-primary-soft text-primary-strong"
                }`}
              >
                {i + 1}
              </span>
              <span className="font-extrabold">
                <span className="sr-only">Passo {i + 1}: </span>
                {label}
              </span>
            </li>
          ))}
        </ol>
        <OnboardingActions>
          <form action={startOnboarding} className="flex flex-col">
            <SubmitButton size="lg" pendingText="Abrindo…">
              Vamos lá
            </SubmitButton>
          </form>
        </OnboardingActions>
      </OnboardingBody>
    </>
  );
}
