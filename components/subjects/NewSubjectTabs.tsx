import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { TopBar } from "@/components/ui/TopBar";

/** Topo da criação de disciplina: fechar, título e Catálogo · Manual · YouTube. */
export function NewSubjectTabs({ active }: { active: "catalogo" | "manual" }) {
  return (
    <div className="flex flex-col gap-4">
      <TopBar
        backHref="/disciplinas"
        backLabel="Fechar e voltar para Disciplinas"
        icon="fechar"
        title={<h1 className="text-title">Nova disciplina</h1>}
      />
      <SegmentedNav
        label="Origem da disciplina"
        items={[
          { label: "Catálogo", href: "/disciplinas/nova", active: active === "catalogo" },
          { label: "Manual", href: "/disciplinas/nova/manual", active: active === "manual" },
          { label: "YouTube", hint: "em breve" },
        ]}
      />
    </div>
  );
}
