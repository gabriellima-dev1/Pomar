import Link from "next/link";
import { Play } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";

/**
 * Card "Falta 1 passo" do Início no 1º pomodoro do onboarding (passo 5), no lugar do
 * destaque do perfil (telas.md › Fluxo do onboarding, revisão de 17/11).
 */
export function FirstFruitCard({ subject }: { subject: { id: string; title: string } }) {
  return (
    <section aria-labelledby="falta-1-passo" className={`${cardClasses} flex flex-col gap-3 p-5`}>
      <p className="text-caption text-primary-strong">Falta 1 passo</p>
      <h2 id="falta-1-passo" className="text-heading">
        Colha seu primeiro fruto
      </h2>
      <p className="text-ink-muted">
        Um pomodoro em {subject.title} e o seu pomar começa a crescer.
      </p>
      <Link
        href={`/pomodoro?disciplina=${subject.id}`}
        className={`${buttonClasses("primary", "lg")} mt-1 gap-2`}
      >
        <Play size={20} aria-hidden fill="currentColor" />
        Começar
      </Link>
    </section>
  );
}
