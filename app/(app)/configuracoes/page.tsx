import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { SubmitButton } from "@/components/forms/fields";
import { RowLink, RowStatic, SettingsSection } from "@/components/settings/rows";
import {
  AlertRow,
  CycleRow,
  DeleteAccount,
  ExperimentCard,
  ExportCard,
  FeiraRow,
  NameRow,
  PublicProfileRow,
  SoundRow,
} from "@/components/settings/SettingsControls";
import { Notice } from "@/components/ui/Notice";
import { TopBar } from "@/components/ui/TopBar";
import { getAccount } from "@/lib/account";
import { requireUser } from "@/lib/auth/session";
import { PROFILE_LABEL } from "@/lib/bartle";
import { formatPace } from "@/lib/estimates";
import { parseThemePreference } from "@/lib/gamification/themes";
import { DIVISION_LABEL } from "@/lib/league/divisions";
import { getLeagueView } from "@/lib/league/queries";
import { loginMethodLabel } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { THEMES } from "@/themes";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Configurações" };

/**
 * Configurações completas (referencias/31, DESIGN §10): Conta, Estudo, Jogo e
 * Privacidade e dados, com Sair e Excluir conta no fim. Nada escondido em submenus.
 */
export default async function ConfiguracoesPage({ searchParams }: PageProps<"/configuracoes">) {
  const user = await requireUser();
  const query = await searchParams;
  const supabase = await createClient();
  const [account, league, { data: p }, { data: auth }] = await Promise.all([
    getAccount(user.id),
    getLeagueView(user.id),
    supabase
      .from("profiles")
      .select("display_name, focus_min, break_min, long_break_min, min_per_page, theme")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const provider = auth.user?.app_metadata?.provider as string | undefined;
  const theme = parseThemePreference(p?.theme);
  const themeSummary =
    theme === "auto"
      ? "Automático · Noturno com o modo escuro do aparelho"
      : `${THEMES[theme].name} · modo escuro desligado`;
  const feiraSummary =
    league.optIn === true
      ? `Participando · Feira de ${DIVISION_LABEL[league.division]}`
      : league.optIn === false
        ? "Fora da Feira"
        : "Ainda não escolheu";

  return (
    <section className="flex flex-col gap-6">
      <TopBar
        backHref="/inicio"
        backLabel="Voltar para o Início"
        title={<h1 className="text-title">Configurações</h1>}
      />

      {query.perfil && <Notice>Perfil salvo! O destaque do Início já mudou.</Notice>}
      {query.feira && <Notice>Escolha da Feira salva.</Notice>}
      {query.apelido && <Notice>Apelido salvo.</Notice>}
      {query.experimento && (
        <Notice>Você saiu do experimento e agora vê todas as recompensas.</Notice>
      )}

      <SettingsSection id="conta" title="Conta">
        <NameRow name={p?.display_name ?? null} />
        <RowLink
          href="/liga/apelido?depois=/configuracoes"
          label="Apelido"
          value={league.username ? `@${league.username}` : "Escolher apelido"}
        />
        <PublicProfileRow username={league.username} initial={league.publicProfile} />
        <RowStatic
          label="E-mail"
          value={`${user.email ?? "sem e-mail"} · ${loginMethodLabel(provider)}`}
        />
      </SettingsSection>

      <SettingsSection id="estudo" title="Estudo">
        <CycleRow
          settings={{
            focus: p?.focus_min ?? 25,
            shortBreak: p?.break_min ?? 5,
            longBreak: p?.long_break_min ?? 15,
          }}
        />
        <RowLink
          href="/calibrar"
          label="Ritmo de leitura padrão"
          value={
            p?.min_per_page
              ? `${formatPace(Number(p.min_per_page))} por página`
              : "Ainda não calibrado"
          }
        />
        <SoundRow />
        <AlertRow />
      </SettingsSection>

      <SettingsSection id="jogo" title="Jogo">
        <RowLink
          href="/onboarding/perfil"
          label="Perfil de jogador"
          value={
            account.bartle
              ? `${PROFILE_LABEL[account.bartle]} · trocar ou refazer o quiz`
              : "Fazer o quiz (muda só o destaque do Início)"
          }
        />
        <RowLink href="/conquistas?aba=temas" label="Tema" value={themeSummary} />
        <FeiraRow optIn={league.optIn} summary={feiraSummary} />
      </SettingsSection>

      <section aria-labelledby="dados" className="flex flex-col gap-3">
        <h2 id="dados" className="text-caption text-ink-muted px-1">
          Privacidade e dados
        </h2>
        <ExperimentCard group={account.experiment} />
        <ExportCard />
        <p className="flex flex-wrap gap-x-6 gap-y-2 px-1">
          <Link href="/privacidade" className="text-primary-strong font-extrabold underline">
            Política de privacidade
          </Link>
          <Link href="/transparencia" className="text-primary-strong font-extrabold underline">
            Transparência
          </Link>
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <form action={signOut} className="flex flex-col">
          <SubmitButton variant="secondary" size="lg" pendingText="Saindo…">
            <LogOut size={20} aria-hidden />
            Sair da conta
          </SubmitButton>
        </form>
        <DeleteAccount username={league.username} />
      </div>

      <p className="text-small text-ink-muted text-center">
        Pomar · projeto da disciplina Computação Persuasiva · UFAL
      </p>
    </section>
  );
}
