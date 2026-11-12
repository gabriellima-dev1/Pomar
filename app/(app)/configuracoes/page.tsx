import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Timer } from "lucide-react";
import { redoQuiz } from "@/app/(onboarding)/onboarding/actions";
import { SubmitButton } from "@/components/forms/fields";
import { LeagueChoice } from "@/components/league/LeagueChoice";
import { ProfileIcon } from "@/components/onboarding/ProfileIcon";
import { buttonClasses } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { TopBar } from "@/components/ui/TopBar";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { PROFILE_LABEL, PROFILE_SUMMARY } from "@/lib/bartle";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Configurações" };

/**
 * Configurações mínimas da Fase 4: perfil de Bartle (trocar ou refazer, DESIGN §6.8),
 * Feira (opt-in, §6.6) e sair da conta. O resto (tema, exportar, excluir) vem na Fase 6.
 */
export default async function ConfiguracoesPage({ searchParams }: PageProps<"/configuracoes">) {
  const user = await requireUser();
  const query = await searchParams;
  const account = await getAccount(user.id);
  const profile = account.bartle;

  return (
    <section className="flex flex-col gap-6">
      <TopBar
        backHref="/inicio"
        backLabel="Voltar para o Início"
        title={<h1 className="text-title">Configurações</h1>}
      />

      {query.perfil && <Notice>Perfil salvo! O destaque do Início já mudou.</Notice>}
      {query.feira && <Notice>Escolha da Feira salva.</Notice>}

      <section aria-labelledby="perfil" className={`${cardClasses} flex flex-col gap-4 p-5`}>
        <h2 id="perfil" className="text-heading">
          Seu perfil de estudo
        </h2>
        {profile ? (
          <div className="flex items-center gap-4">
            <ProfileIcon profile={profile} size={56} />
            <div className="flex min-w-0 flex-col">
              <span className="font-extrabold">{PROFILE_LABEL[profile]}</span>
              <span className="text-small text-ink-muted">
                Destaque no Início: {PROFILE_SUMMARY[profile].toLowerCase()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-ink-muted">
            Você ainda não fez o quiz. Ele muda só o card de destaque do Início.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {profile ? (
            <>
              <Link href="/onboarding/perfil" className={buttonClasses("secondary", "md")}>
                Ver meu perfil
              </Link>
              <Link
                href="/onboarding/perfil?escolher=1"
                className={buttonClasses("secondary", "md")}
              >
                Escolher outro perfil
              </Link>
              <form action={redoQuiz} className="flex flex-col">
                <SubmitButton variant="ghost" pendingText="Abrindo…">
                  Refazer o quiz
                </SubmitButton>
              </form>
            </>
          ) : (
            <Link href="/onboarding/quiz" className={buttonClasses("secondary", "md")}>
              Fazer o quiz
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="feira" className={`${cardClasses} flex flex-col gap-4 p-5`}>
        <div className="flex flex-col gap-1">
          <h2 id="feira" className="text-heading">
            Feira
          </h2>
          <p className="text-ink-muted">
            Ranking semanal com quem estuda um tempo parecido. Só aparecem o seu apelido e o seu XP
            da semana.
          </p>
        </div>
        <LeagueChoice
          context="configuracoes"
          initial={account.leagueOptIn}
          submitLabel="Salvar escolha"
        />
      </section>

      <section aria-labelledby="conta" className={`${cardClasses} flex flex-col gap-3 p-5`}>
        <h2 id="conta" className="text-heading">
          Conta
        </h2>
        <Link
          href="/calibrar"
          className="bg-surface-300 flex min-h-14 items-center gap-3 rounded-lg px-4 py-3 font-extrabold"
        >
          <Timer size={22} aria-hidden className="text-primary shrink-0" />
          Meu ritmo de leitura
        </Link>
        <form action={signOut} className="flex flex-col">
          <SubmitButton variant="secondary" pendingText="Saindo…">
            <LogOut size={20} aria-hidden />
            Sair da conta
          </SubmitButton>
        </form>
      </section>
    </section>
  );
}
