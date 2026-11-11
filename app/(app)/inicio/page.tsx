import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatChip } from "@/components/ui/StatChip";
import { requireUser } from "@/lib/auth/session";
import { localDay } from "@/lib/dates";
import {
  getHomeProfile,
  getPreferences,
  getStudyHistory,
  listSubjects,
  sortByLastStudied,
} from "@/lib/subjects/queries";
import { greeting, localParts } from "@/lib/subjects/summary";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Início" };

const STEPS = [
  { strong: "Escolha o que estudar", rest: " e marque os capítulos." },
  { strong: "Calibre seu ritmo", rest: " lendo uma página com o cronômetro." },
  { strong: "Colha um fruto", rest: " a cada pomodoro concluído." },
];

export default async function InicioPage() {
  const user = await requireUser();
  const [profile, prefs, all] = await Promise.all([
    getHomeProfile(user.id),
    getPreferences(user.id),
    listSubjects(),
  ]);
  const history = await getStudyHistory(profile.timezone);
  const subjects = sortByLastStudied(all, history);
  const today = localDay(new Date(), profile.timezone);

  const { hour, dateLabel } = localParts(new Date(), profile.timezone);
  const empty = subjects.length === 0;
  const hello = empty ? "Olá" : greeting(hour);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3 pt-2">
        <div className="flex flex-col gap-1">
          <p className="text-small text-ink-muted">{dateLabel}</p>
          <h1 className="font-display text-[28px] leading-9 font-semibold">
            {hello}
            {profile.name ? `, ${profile.name}` : ""}
          </h1>
        </div>
        {!empty && <SeuTomas size={52} className="shrink-0" />}
      </header>

      <div className="flex flex-wrap gap-2">
        <StatChip kind="ofensiva" value={profile.streak} />
        {profile.xp > 0 && <StatChip kind="xp" value={profile.xp} />}
        <StatChip kind="nivel" value={profile.level} />
      </div>

      {empty ? (
        <>
          <EmptyState
            title="Seu pomar ainda está vazio"
            action={
              <Link href="/disciplinas/nova" className={buttonClasses("primary", "lg")}>
                Criar minha primeira disciplina
              </Link>
            }
          >
            Escolha um livro do catálogo ou monte sua lista de capítulos. Eu calculo quanto tempo
            falta.
          </EmptyState>
          <section aria-labelledby="como-funciona" className="flex flex-col gap-4">
            <h2 id="como-funciona" className="text-caption text-ink-muted">
              Como funciona
            </h2>
            <ol className="flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <li key={step.strong} className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="bg-primary-soft text-primary-strong font-display grid size-11 shrink-0 place-items-center rounded-full text-lg font-semibold"
                  >
                    {i + 1}
                  </span>
                  <p>
                    <strong className="font-extrabold">{step.strong}</strong>
                    {step.rest}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : (
        <section aria-labelledby="suas-disciplinas" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="suas-disciplinas" className="text-heading">
              Suas disciplinas
            </h2>
            <Link
              href="/disciplinas/nova"
              className="text-primary inline-flex min-h-11 items-center gap-1 px-1 font-extrabold"
            >
              <Plus size={22} aria-hidden />
              Nova
              <span className="sr-only"> disciplina</span>
            </Link>
          </div>
          <ul className="flex flex-col gap-6">
            {subjects.map((s) => (
              <li key={s.id}>
                <SubjectCard
                  subject={s}
                  globalPace={prefs.globalPace}
                  history={history.get(s.id)}
                  today={today}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Até existirem as Configurações (Fase 6) — DECISOES 10/11. */}
      <form action={signOut} className="flex justify-center pt-4">
        <button
          type="submit"
          className="text-small text-ink-muted min-h-11 px-3 underline underline-offset-4"
        >
          Sair da conta
        </button>
      </form>
    </div>
  );
}
