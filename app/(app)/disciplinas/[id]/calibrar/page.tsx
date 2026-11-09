import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/subjects/BackLink";
import { CalibrationForm } from "@/components/subjects/CalibrationForm";
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
  const [subject, prefs] = await Promise.all([getSubject(id), getPreferences(user.id)]);
  if (!subject) notFound();

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <BackLink href={`/disciplinas/${subject.id}`}>{subject.title}</BackLink>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Quanto tempo você leva por página?</h1>
        <p className="text-muted">
          Cada livro tem seu ritmo. Com essa medida, o Seu Tomás estima quanto falta para terminar{" "}
          <strong className="text-foreground">{subject.title}</strong>. Você pode recalibrar quando
          quiser.
        </p>
      </div>
      <CalibrationForm subjectId={subject.id} hasGlobalPace={prefs.globalPace !== null} />
    </section>
  );
}
