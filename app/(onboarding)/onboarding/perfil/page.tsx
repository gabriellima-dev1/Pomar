import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SubmitButton } from "@/components/forms/fields";
import { ProfileIcon } from "@/components/onboarding/ProfileIcon";
import { OnboardingActions, OnboardingBody, StepLabel } from "@/components/onboarding/Shell";
import { buttonClasses } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import {
  PROFILES,
  PROFILE_HIGHLIGHT,
  PROFILE_LABEL,
  PROFILE_SUMMARY,
  rankedScores,
} from "@/lib/bartle";
import { chooseProfile, redoQuiz } from "../actions";

export const metadata: Metadata = { title: "Seu perfil" };

/**
 * Tela 18 · Seu perfil (DESIGN §6.8): resultado do quiz, "Continuar como {perfil}",
 * "Escolher outro perfil" (?escolher=1) e "Refazer o quiz". Fora do onboarding, é a
 * mesma tela aberta pelas Configurações.
 */
export default async function PerfilPage({ searchParams }: PageProps<"/onboarding/perfil">) {
  const user = await requireUser();
  const { escolher } = await searchParams;
  const account = await getAccount(user.id);
  const profile = account.bartle;
  if (!profile) redirect("/onboarding/quiz");
  const onboarding = account.step !== "concluido";

  if (escolher === "1") {
    return (
      <OnboardingBody>
        <div className="flex min-h-14 items-center gap-2">
          <Link
            href="/onboarding/perfil"
            aria-label="Voltar para o seu perfil"
            className="text-ink -ml-2.5 inline-grid size-11 place-items-center rounded-full"
          >
            <ChevronLeft size={28} aria-hidden />
          </Link>
          {onboarding && <StepLabel step={1} />}
        </div>
        <h1 className="text-display">Escolher outro perfil</h1>
        <p className="text-ink-muted">
          O perfil só muda o card de destaque do Início. Você pode trocar quando quiser.
        </p>
        <ul className="flex flex-col gap-3">
          {PROFILES.map((p) => (
            <li key={p}>
              <form action={chooseProfile}>
                <input type="hidden" name="perfil" value={p} />
                <button
                  type="submit"
                  aria-current={p === profile ? "true" : undefined}
                  className={`shadow-card flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left ${
                    p === profile ? "border-primary bg-primary-soft" : "bg-surface-200 border-line"
                  }`}
                >
                  <ProfileIcon profile={p} size={56} />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-heading">
                      {PROFILE_LABEL[p]}
                      {p === profile && <span className="sr-only"> (atual)</span>}
                    </span>
                    <span className="text-small text-ink-muted">{PROFILE_SUMMARY[p]}</span>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </OnboardingBody>
    );
  }

  const label = PROFILE_LABEL[profile];
  return (
    <OnboardingBody>
      {onboarding ? (
        <StepLabel step={1} done />
      ) : (
        <div className="flex min-h-11 items-center">
          <Link
            href="/configuracoes"
            aria-label="Voltar para Configurações"
            className="text-ink -ml-2.5 inline-grid size-11 place-items-center rounded-full"
          >
            <ChevronLeft size={28} aria-hidden />
          </Link>
        </div>
      )}

      <section className={`${cardClasses} flex flex-col items-center gap-3 p-6 text-center`}>
        <ProfileIcon profile={profile} />
        <p className="text-caption text-ink-muted">Seu perfil</p>
        <h1 className="font-display text-[34px] leading-10 font-semibold">{label}</h1>
        <p className="text-ink-muted text-lg">
          {PROFILE_HIGHLIGHT[profile].map((seg, i) =>
            seg.strong ? (
              <strong key={i} className="text-ink font-extrabold">
                {seg.text}
              </strong>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      </section>

      {account.scores && (
        <section
          aria-labelledby="suas-respostas"
          className={`${cardClasses} flex flex-col gap-3 p-5`}
        >
          <h2 id="suas-respostas" className="text-caption text-ink-muted">
            Suas respostas
          </h2>
          <ul className="flex flex-col gap-2.5">
            {rankedScores(account.scores, profile).map(([p, value]) => (
              <li key={p} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3">
                <span className="font-extrabold">{PROFILE_LABEL[p]}</span>
                <span aria-hidden className="bg-surface-300 h-3 overflow-hidden rounded-full">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${value}%`,
                      backgroundColor: p === profile ? "var(--primary)" : "var(--control-border)",
                    }}
                  />
                </span>
                <span className="text-right font-extrabold tabular-nums">{value}%</span>
              </li>
            ))}
          </ul>
          <p className="text-small text-ink-muted">
            Ninguém é um perfil só. Isso muda apenas a ordem do que aparece no Início, e você troca
            quando quiser em Configurações.
          </p>
        </section>
      )}

      <OnboardingActions>
        <form action={chooseProfile} className="flex flex-col">
          <input type="hidden" name="perfil" value={profile} />
          <SubmitButton size="lg" pendingText="Salvando…">
            {onboarding ? `Continuar como ${label}` : `Usar o perfil ${label}`}
          </SubmitButton>
        </form>
        <Link href="/onboarding/perfil?escolher=1" className={buttonClasses("secondary", "md")}>
          Escolher outro perfil
        </Link>
        <form action={redoQuiz} className="flex flex-col">
          <SubmitButton variant="ghost" pendingText="Abrindo…">
            Refazer o quiz
          </SubmitButton>
        </form>
      </OnboardingActions>
    </OnboardingBody>
  );
}
