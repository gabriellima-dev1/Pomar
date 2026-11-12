import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sprout, Timer } from "lucide-react";
import { BadgeDisc } from "@/components/gamification/BadgeDisc";
import { HarvestMedal } from "@/components/gamification/HarvestMedal";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { GlassTimer } from "@/components/pomodoro/GlassTimer";
import { Scene } from "@/components/scenes/Scene";
import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { buttonClasses } from "@/components/ui/Button";
import { landingCounters, type Counter } from "@/lib/landing-stats";
import { getLandingStats } from "@/lib/landing.server";

export const metadata: Metadata = {
  title: { absolute: "Pomar · cada ciclo de foco vira um fruto" },
  description:
    "Cadastre o livro ou o curso que você precisa vencer. O Pomar mede o seu ritmo, diz quanto falta e transforma cada pomodoro em progresso que dá para ver.",
};

/** Números reais em cache curto (telas.md › 15). Quem está logado nem chega aqui (proxy). */
export const revalidate = 300;

const STEPS = [
  {
    title: "Cadastre o que precisa estudar",
    text: "Escolha um livro do catálogo, monte sua lista de capítulos ou importe uma playlist do YouTube.",
  },
  {
    title: "Foque por 25 minutos",
    text: "Um clique começa o pomodoro no próximo tópico. O cronômetro continua mesmo se você trocar de aba.",
  },
  {
    title: "Colha e veja quanto falta",
    text: "Cada ciclo vira um fruto. Com o seu ritmo por página, o Pomar prevê quando você termina.",
  },
];

const FAIR_PLAY = [
  { strong: "Pausar não tira nada.", rest: " O app só sugere reiniciar o ciclo." },
  { strong: "Ranking e perfil público só se você quiser.", rest: " Nada vem marcado." },
  { strong: "Nada para comprar.", rest: " Sem moedas e sem caixas-surpresa." },
  { strong: "Nenhum aviso chato.", rest: " Só o aviso de fim do ciclo, se você quiser." },
];

const container = "mx-auto w-full max-w-[1200px] px-6";

function CounterIcon({ kind }: { kind: Counter["key"] }) {
  const base = "grid size-12 shrink-0 place-items-center rounded-full";
  if (kind === "pomodoros") {
    return (
      <span aria-hidden className={`${base} bg-fruit-soft`}>
        <span className="bg-fruit block size-4 rounded-full" />
      </span>
    );
  }
  if (kind === "horas") {
    return (
      <span aria-hidden className={`${base} bg-primary-soft text-primary-strong`}>
        <Timer size={22} />
      </span>
    );
  }
  return (
    <span aria-hidden className={`${base} bg-reward/25 text-ink`}>
      <Sprout size={22} />
    </span>
  );
}

/** Landing (referencias/15-landing-desktop.png e 15b-landing-celular.png). */
export default async function LandingPage() {
  const counters = landingCounters(await getLandingStats());

  return (
    <div data-theme="classico" className="bg-surface-100 text-ink flex flex-1 flex-col">
      <TrackOnMount event="landing_viewed" />

      <header className={`${container} flex flex-wrap items-center gap-x-6 gap-y-3 py-5`}>
        <Link href="/" className="mr-auto flex items-center gap-2">
          <SeuTomas size={40} />
          <span className="font-display text-[26px] font-semibold">Pomar</span>
        </Link>
        <nav aria-label="Página inicial" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="#como-funciona" className="min-h-11 content-center font-extrabold">
            Como funciona
          </a>
          <Link href="/transparencia" className="min-h-11 content-center font-extrabold">
            Transparência
          </Link>
          <Link href="/login" className={buttonClasses("secondary", "sm", "text-ink")}>
            Entrar
          </Link>
        </nav>
      </header>

      <main className="flex flex-col">
        <section className={`${container} grid items-center gap-10 py-8 md:grid-cols-2 md:py-12`}>
          <div className="flex flex-col items-start gap-5">
            <span className="text-caption bg-primary-soft text-primary-strong rounded-full px-3 py-1.5">
              Estude com a técnica Pomodoro
            </span>
            <h1 className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.08] font-semibold">
              Cada ciclo de foco vira um fruto no seu pomar.
            </h1>
            <p className="text-ink-muted text-lg">
              Cadastre o livro ou o curso que você precisa vencer. O Pomar mede o seu ritmo, diz
              quanto falta e transforma cada pomodoro concluído em progresso que dá para ver.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/cadastro" className={buttonClasses("primary", "lg")}>
                Criar conta grátis
              </Link>
              <a href="#como-funciona" className={buttonClasses("ghost", "lg")}>
                Ver como funciona
              </a>
            </div>
            <p className="text-small text-ink-muted font-semibold">
              Grátis, sem nada para comprar. Entre com e-mail ou Google.
            </p>
          </div>
          <div className="shadow-dialog relative aspect-[556/437] w-full overflow-hidden rounded-[32px] bg-[var(--scene-sky-bottom)]">
            <Scene
              theme="classico"
              stage="adulta"
              progress={0.7}
              viewBox="0 180 390 400"
              preserveAspectRatio="xMidYMid slice"
            />
            <div className="absolute top-[14%] left-[8%] origin-top-left scale-[0.62] sm:scale-75 md:scale-[0.62] lg:scale-75">
              <GlassTimer
                label="Foco"
                seconds={18 * 60 + 42}
                srLabel="Exemplo de cronômetro: 18 minutos e 42 segundos de foco"
              />
            </div>
          </div>
        </section>

        {counters.length > 0 && (
          <section aria-label="O Pomar em números" className="bg-surface-200 border-line border-y">
            <div className={`${container} flex flex-col gap-5 py-7`}>
              <ul className="grid gap-5 sm:grid-cols-3">
                {counters.map((c) => (
                  <li key={c.key} className="flex items-center gap-4">
                    <CounterIcon kind={c.key} />
                    <span className="flex flex-col">
                      <span className="font-display text-[32px] leading-9 font-semibold tabular-nums">
                        {c.value}
                      </span>
                      <span className="text-small text-ink-muted font-extrabold">{c.label}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-small text-ink-muted font-semibold">
                Números reais do app. Contas de demonstração não entram na conta.
              </p>
            </div>
          </section>
        )}

        <section
          id="como-funciona"
          aria-labelledby="como-funciona-titulo"
          className={`${container} flex scroll-mt-6 flex-col gap-6 py-14`}
        >
          <h2
            id="como-funciona-titulo"
            className="font-display text-[34px] leading-10 font-semibold"
          >
            Como funciona
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-surface-200 flex flex-col gap-3 rounded-lg p-6">
                <span
                  aria-hidden
                  className="bg-primary text-on-primary font-display grid size-10 place-items-center rounded-full text-lg font-semibold"
                >
                  {i + 1}
                </span>
                <h3 className="text-heading">{s.title}</h3>
                <p className="text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${container} grid items-center gap-8 pb-16 md:grid-cols-2`}>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[34px] leading-10 font-semibold">
              Um pomar que cresce com você
            </h2>
            <p className="text-ink-muted text-lg">
              Sua árvore cresce a cada nível. Todo dia com estudo rende um fruto do dia, e a semana
              vira uma colheita de bronze, prata ou ouro. Colheitas liberam temas novos, como
              Halloween e Natal, que ficam com você para sempre.
            </p>
          </div>
          <div className="bg-surface-200 flex items-center justify-center gap-4 rounded-lg px-6 py-8">
            <BadgeDisc code="coruja" rarity="comum" size={64} />
            <BadgeDisc code="finalizador" rarity="incomum" size={64} />
            <BadgeDisc code="fruto_dourado" rarity="raro" size={64} />
            <HarvestMedal tier="ouro" size={52} label="Medalha da Colheita de Ouro" />
            <span className="sr-only">Emblemas comum, incomum e raro</span>
          </div>
        </section>

        <section aria-labelledby="jogo-limpo" className="bg-primary-soft">
          <div className={`${container} flex flex-col gap-6 py-14`}>
            <h2 id="jogo-limpo" className="font-display text-[34px] leading-10 font-semibold">
              Jogo limpo
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FAIR_PLAY.map((item) => (
                <li key={item.strong} className="flex gap-3">
                  <Check
                    size={22}
                    aria-hidden
                    className="text-primary mt-0.5 shrink-0"
                    strokeWidth={3}
                  />
                  <p>
                    <strong className="font-extrabold">{item.strong}</strong>
                    {item.rest}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              href="/transparencia"
              className="text-primary-strong self-start font-extrabold underline underline-offset-4"
            >
              Veja cada técnica que usamos e por quê
            </Link>
          </div>
        </section>

        <section
          className={`${container} flex flex-col items-center justify-center gap-6 py-16 text-center sm:flex-row sm:text-left`}
        >
          <SeuTomas size={96} />
          <div className="flex flex-col items-center gap-4">
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.4rem)] leading-tight font-semibold">
              Seu pomar começa com um pomodoro.
            </h2>
            <Link href="/cadastro" className={buttonClasses("primary", "lg")}>
              Criar conta grátis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-line border-t">
        <div
          className={`${container} text-small text-ink-muted flex flex-wrap items-center gap-x-6 gap-y-2 py-6 font-semibold`}
        >
          <p className="mr-auto">
            Projeto da disciplina Computação Persuasiva · UFAL Campus Arapiraca
          </p>
          <Link href="/transparencia" className="text-primary-strong underline underline-offset-4">
            Transparência
          </Link>
          <Link href="/privacidade" className="text-primary-strong underline underline-offset-4">
            Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
