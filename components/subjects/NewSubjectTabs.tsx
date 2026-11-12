import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { TopBar } from "@/components/ui/TopBar";

/**
 * Topo da criação de disciplina: fechar, título e Catálogo · Manual · YouTube.
 * No onboarding vira o "Passo 3 de 5" (telas.md › Fluxo do onboarding).
 */
export function NewSubjectTabs({
  active,
  onboarding = false,
}: {
  active: "catalogo" | "manual" | "youtube";
  onboarding?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {onboarding ? (
        <TopBar
          backHref="/onboarding/feira"
          backLabel="Voltar para o passo anterior"
          title={
            <div className="flex flex-col">
              <p className="text-small text-ink-muted font-extrabold">Passo 3 de 5</p>
              <h1 className="text-title">Sua primeira disciplina</h1>
            </div>
          }
        />
      ) : (
        <TopBar
          backHref="/disciplinas"
          backLabel="Fechar e voltar para Disciplinas"
          icon="fechar"
          title={<h1 className="text-title">Nova disciplina</h1>}
        />
      )}
      <SegmentedNav
        label="Origem da disciplina"
        items={[
          { label: "Catálogo", href: "/disciplinas/nova", active: active === "catalogo" },
          { label: "Manual", href: "/disciplinas/nova/manual", active: active === "manual" },
          { label: "YouTube", href: "/disciplinas/nova/youtube", active: active === "youtube" },
        ]}
      />
    </div>
  );
}
