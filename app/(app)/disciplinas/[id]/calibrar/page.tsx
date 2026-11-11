import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { skipOnboardingCalibration } from "@/app/(app)/disciplinas/actions";
import { SubmitButton } from "@/components/forms/fields";
import { CalibrationForm } from "@/components/subjects/CalibrationForm";
import { TopBar } from "@/components/ui/TopBar";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { getPreferences, getSubject } from "@/lib/subjects/queries";
import { isUuid } from "@/lib/subjects/validation";

export const metadata: Metadata = { title: "Calibrar ritmo" };

export default async function CalibrarDisciplinaPage({
  params,
}: PageProps<"/disciplinas/[id]/calibrar">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [subject, prefs, account] = await Promise.all([
    getSubject(id),
    getPreferences(user.id),
    getAccount(user.id),
  ]);
  if (!subject) notFound();
  // Onboarding, passo 4 (telas.md › Fluxo do onboarding): pode pular.
  const onboarding = account.step === "calibracao";

  return (
    <section className="flex flex-col gap-5">
      <TopBar
        backHref={`/disciplinas/${subject.id}`}
        backLabel={`Voltar para ${subject.title}`}
        title={
          <p className="text-small text-ink-muted truncate font-extrabold">
            {onboarding ? "Passo 4 de 5" : subject.title}
          </p>
        }
      />
      <h1 className="text-display">Quanto tempo você leva por página?</h1>
      <CalibrationForm subjectId={subject.id} hasGlobalPace={prefs.globalPace !== null} />
      {onboarding && (
        <form action={skipOnboardingCalibration} className="flex justify-center">
          <input type="hidden" name="subjectId" value={subject.id} />
          <SubmitButton variant="ghost" pendingText="Indo…">
            Pular por agora
          </SubmitButton>
        </form>
      )}
    </section>
  );
}
