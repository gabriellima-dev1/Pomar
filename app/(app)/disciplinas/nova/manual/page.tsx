import type { Metadata } from "next";
import { BackLink } from "@/components/subjects/BackLink";
import { ManualSubjectForm } from "@/components/subjects/ManualSubjectForm";
import { suggestColor } from "@/lib/subjects/colors";
import { countSubjects } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Nova disciplina manual" };

export default async function ManualPage() {
  const count = await countSubjects();
  return (
    <section className="flex flex-col gap-6">
      <BackLink href="/disciplinas/nova">Nova disciplina</BackLink>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Nova disciplina manual</h1>
        <p className="text-muted max-w-prose">
          Monte do seu jeito: uma apostila, um livro que não está no catálogo, uma lista de
          leituras.
        </p>
      </div>
      <ManualSubjectForm defaultColor={suggestColor(count)} />
    </section>
  );
}
