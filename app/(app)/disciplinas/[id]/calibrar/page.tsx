import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalibrationForm } from "@/components/subjects/CalibrationForm";
import { TopBar } from "@/components/ui/TopBar";
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
    <section className="flex flex-col gap-5">
      <TopBar
        backHref={`/disciplinas/${subject.id}`}
        backLabel={`Voltar para ${subject.title}`}
        title={<p className="text-small text-ink-muted truncate font-extrabold">{subject.title}</p>}
      />
      <h1 className="text-display">Quanto tempo você leva por página?</h1>
      <CalibrationForm subjectId={subject.id} hasGlobalPace={prefs.globalPace !== null} />
    </section>
  );
}
