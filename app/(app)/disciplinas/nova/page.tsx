import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/subjects/BackLink";

export const metadata: Metadata = { title: "Nova disciplina" };

const optionClass =
  "border-border bg-surface hover:border-foreground/40 flex flex-col gap-1 rounded-xl border p-5";

export default function NovaDisciplinaPage() {
  return (
    <section className="flex flex-col gap-6">
      <BackLink href="/disciplinas">Disciplinas</BackLink>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Nova disciplina</h1>
        <p className="text-muted max-w-prose">De onde vem o que você vai estudar?</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        <li>
          <Link href="/disciplinas/nova/catalogo" className={optionClass}>
            <span className="text-2xl" aria-hidden>
              📚
            </span>
            <span className="font-semibold">Do catálogo</span>
            <span className="text-muted text-sm">
              Escolha um livro e marque os capítulos. A estrutura vem pronta.
            </span>
          </Link>
        </li>
        <li>
          <Link href="/disciplinas/nova/manual" className={optionClass}>
            <span className="text-2xl" aria-hidden>
              ✍️
            </span>
            <span className="font-semibold">Manual</span>
            <span className="text-muted text-sm">
              Monte seus capítulos e tópicos com as páginas de cada um.
            </span>
          </Link>
        </li>
        <li>
          <div className={`${optionClass} opacity-60`}>
            <span className="text-2xl" aria-hidden>
              ▶️
            </span>
            <span className="font-semibold">Playlist do YouTube</span>
            <span className="text-muted text-sm">Em breve: cada vídeo vira um tópico.</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
