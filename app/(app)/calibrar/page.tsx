import type { Metadata } from "next";
import { CalibrationForm } from "@/components/subjects/CalibrationForm";
import { TopBar } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth/session";
import { formatPace } from "@/lib/estimates";
import { getPreferences } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Meu ritmo de leitura" };

/** Ritmo padrão (global): usado pelas disciplinas que ainda não foram calibradas. */
export default async function CalibrarPage() {
  const user = await requireUser();
  const prefs = await getPreferences(user.id);

  return (
    <section className="flex flex-col gap-5">
      <TopBar
        backHref="/disciplinas"
        backLabel="Voltar para Disciplinas"
        title={<p className="text-small text-ink-muted font-extrabold">Meu ritmo de leitura</p>}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-display">Quanto tempo você leva por página?</h1>
        <p className="text-ink-muted">
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
