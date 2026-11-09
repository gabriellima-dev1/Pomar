import type { Metadata } from "next";
import { BackLink } from "@/components/subjects/BackLink";
import { CalibrationForm } from "@/components/subjects/CalibrationForm";
import { requireUser } from "@/lib/auth/session";
import { formatPace } from "@/lib/estimates";
import { getPreferences } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Meu ritmo de leitura" };

/** Ritmo padrão (global): usado pelas disciplinas que ainda não foram calibradas. */
export default async function CalibrarPage() {
  const user = await requireUser();
  const prefs = await getPreferences(user.id);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <BackLink href="/disciplinas">Disciplinas</BackLink>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Meu ritmo de leitura</h1>
        <p className="text-muted">
          {prefs.globalPace !== null
            ? `Seu ritmo padrão hoje é ${formatPace(prefs.globalPace)} por página.`
            : "Você ainda não tem um ritmo padrão: as estimativas usam 3 min por página."}{" "}
          Ele vale para as disciplinas que ainda não foram calibradas.
        </p>
      </div>
      <CalibrationForm subjectId={null} hasGlobalPace={prefs.globalPace !== null} />
    </section>
  );
}
