import type { Metadata } from "next";
import { ManualSubjectForm } from "@/components/subjects/ManualSubjectForm";
import { NewSubjectTabs } from "@/components/subjects/NewSubjectTabs";
import { suggestColor } from "@/lib/subjects/colors";
import { countSubjects } from "@/lib/subjects/queries";

export const metadata: Metadata = { title: "Nova disciplina manual" };

export default async function ManualPage() {
  const count = await countSubjects();
  return (
    <section className="flex flex-col gap-5">
      <NewSubjectTabs active="manual" />
      <p className="text-ink-muted">
        Monte do seu jeito: uma apostila, um livro que não está no catálogo, uma lista de leituras.
      </p>
      <ManualSubjectForm defaultColor={suggestColor(count)} />
    </section>
  );
}
