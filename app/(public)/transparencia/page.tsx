import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { LeaveExperimentButton } from "@/components/settings/SettingsControls";
import { buttonClasses } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { experimentGroup } from "@/lib/cohorts";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Transparência",
  description: "Cada técnica de persuasão que o Pomar usa, onde ela aparece e por quê.",
};

type Tecnica = {
  conceito: string;
  titulo: string;
  onde: string;
  porque: string;
  /** "Você controla", "Limite" ou "Suavizado". */
  controle: { rotulo: string; texto: string };
};

/**
 * As técnicas da tela 33, em linguagem simples, alinhadas ao DESIGN §3. Cada afirmação
 * aqui precisa ser verdade no app (o checklist de ética do §10 confere).
 */
const TECNICAS: Tecnica[] = [
  {
    conceito: "Fogg · B = MAP",
    titulo: "Tornar fácil começar",
    onde: 'o botão "Começar" já abre o pomodoro no próximo tópico; o aviso de fim do ciclo chama de volta.',
    porque: "quanto menos passos, mais fácil virar hábito.",
    controle: { rotulo: "Você controla", texto: "o aviso pode ser desligado em Configurações." },
  },
  {
    conceito: "Hook · recompensa variável",
    titulo: "O fruto do dia é sorteado",
    onde: "todo dia com estudo rende um emblema, sorteado entre os que você mereceu.",
    porque: "a surpresa deixa a volta ao app mais interessante.",
    controle: {
      rotulo: "Limite",
      texto: "sempre sai um emblema; só varia qual. Nada é comprável.",
    },
  },
  {
    conceito: "Kairos · nudge",
    titulo: "O empurrãozinho na pausa",
    onde: "ao pausar, sugerimos reiniciar o ciclo; em outubro e dezembro, sugerimos o tema da época.",
    porque: "a sugestão chega no momento em que faz diferença.",
    controle: {
      rotulo: "Você controla",
      texto: '"Continuar mesmo assim" está sempre ali. Pausar não tira nada.',
    },
  },
  {
    conceito: "Default saudável",
    titulo: "25 de foco, 5 de descanso",
    onde: "o ciclo começa no padrão da técnica Pomodoro, com descanso longo a cada 4.",
    porque: "um bom ponto de partida para quem nunca usou a técnica.",
    controle: { rotulo: "Você controla", texto: "foco de 15 a 60 min e descansos de 5 a 30." },
  },
  {
    conceito: "Cialdini · prova social",
    titulo: "Ver outras pessoas estudando",
    onde: "a Feira semanal, as conquistas de quem você segue e os números da página inicial.",
    porque: "saber que outros estudam no mesmo ritmo ajuda a manter o seu.",
    controle: {
      rotulo: "Você controla",
      texto: "Feira e perfil público só se você quiser; nada vem marcado. Os números são reais.",
    },
  },
  {
    conceito: "Aversão à perda",
    titulo: "A ofensiva de dias seguidos",
    onde: "o contador de dias com estudo no Início.",
    porque: "não querer quebrar a sequência ajuda a voltar no dia seguinte.",
    controle: {
      rotulo: "Suavizado",
      texto: "congelamentos automáticos cobrem dias sem estudo, e nenhuma mensagem cobra você.",
    },
  },
  {
    conceito: "Compromisso e consistência",
    titulo: "Data da prova e meta do dia",
    onde: "ao criar a disciplina, você pode dizer quando é a prova e quantos pomodoros quer por dia.",
    porque: "um compromisso dito por você mesmo puxa a ação.",
    controle: { rotulo: "Você controla", texto: "as duas coisas são opcionais." },
  },
  {
    conceito: "Escassez",
    titulo: "Emblemas raros e secretos",
    onde: "o álbum de Conquistas tem emblemas que quase nunca saem.",
    porque: "o raro dá vontade de descobrir.",
    controle: { rotulo: "Limite", texto: "nunca à venda, e temas conquistados ficam para sempre." },
  },
  {
    conceito: "Personalização · Bartle",
    titulo: "Um Início do seu jeito",
    onde: "o quiz do começo escolhe o card de destaque do Início.",
    porque: "cada pessoa se motiva com coisas diferentes.",
    controle: {
      rotulo: "Você controla",
      texto: "troque o perfil ou refaça o quiz em Configurações.",
    },
  },
  {
    conceito: "Auto-monitoramento · ancoragem",
    titulo: "Quanto falta, de verdade",
    onde: 'previsão de término nas disciplinas, estatísticas com o "previsto × real" e o ritmo de cada ciclo comparado com o previsto.',
    porque: "ver o próprio progresso motiva e ajuda a planejar.",
    controle: {
      rotulo: "Você controla",
      texto: "o ritmo é seu e pode ser recalibrado quando quiser.",
    },
  },
  {
    conceito: "Cialdini · afeição",
    titulo: "O Seu Tomás",
    onde: "o mascote comenta o progresso, explica as telas e comemora com você.",
    porque: "um personagem simpático deixa o app mais acolhedor.",
    controle: { rotulo: "Limite", texto: "ele nunca culpa você por não ter estudado." },
  },
  {
    conceito: "Gamificação",
    titulo: "XP, níveis e a árvore",
    onde: "cada pomodoro concluído dá XP, a árvore cresce com o nível e a semana vira uma colheita.",
    porque: "progresso visível dá sensação de competência.",
    controle: {
      rotulo: "Limite",
      texto: "a partir do nível 10, o app destaca o que você domina, não o XP.",
    },
  },
];

const NAO_FAZEMOS = [
  "Nada para comprar: sem moedas, sem caixas-surpresa.",
  "Nenhum aviso que você não pediu.",
  "Nada de ranking ou perfil público por padrão.",
  "Sem punição por pausar ou por ficar dias sem estudar.",
  "Sem números inventados: contas de demonstração têm selo e ficam fora das contas.",
  "Sem armadilha para sair: exportar e excluir a conta ficam em Configurações, a um clique.",
];

const container = "mx-auto w-full max-w-[1200px] px-6";
const anchor = "text-primary-strong min-h-11 content-center font-extrabold";

type Quadro = { kind: "visitante" } | { kind: "A" | "B" } | { kind: "saiu" } | { kind: "fora" };

async function quadroDoGrupo(): Promise<Quadro> {
  const user = await getCurrentUser();
  if (!user) return { kind: "visitante" };
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_cohorts")
    .select("cohort, left_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (data?.left_at) return { kind: "saiu" };
  const group = experimentGroup(data);
  return group === "fora" ? { kind: "fora" } : { kind: group };
}

/**
 * Transparência (referencias/33, DESIGN §10): técnicas, o que não fazemos, o experimento
 * (com o grupo de quem está logado e "Sair do experimento") e o que registramos.
 */
export default async function TransparenciaPage() {
  const quadro = await quadroDoGrupo();

  return (
    <div data-theme="classico" className="bg-surface-100 text-ink flex flex-1 flex-col">
      <header className={`${container} flex flex-wrap items-center gap-x-6 gap-y-3 py-5`}>
        <Link href="/" className="mr-auto flex items-center gap-2">
          <SeuTomas size={40} />
          <span className="font-display text-[26px] font-semibold">Pomar</span>
        </Link>
        <nav aria-label="Nesta página" className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href="#tecnicas" className={anchor}>
            Técnicas
          </a>
          <a href="#nao-fazemos" className={anchor}>
            O que não fazemos
          </a>
          <a href="#experimento" className={anchor}>
            Experimento
          </a>
          <a href="#seus-dados" className={anchor}>
            Seus dados
          </a>
        </nav>
      </header>

      <main className="flex flex-col">
        <section className={`${container} flex flex-col items-start gap-4 pt-4 pb-10`}>
          <span className="bg-primary-soft text-primary-strong text-caption rounded-full px-3 py-1">
            Transparência
          </span>
          <h1 className="font-display max-w-3xl text-[40px] leading-[1.1] font-semibold md:text-[52px]">
            Como o Pomar tenta te convencer a estudar
          </h1>
          <p className="text-ink-muted max-w-2xl text-lg">
            O Pomar usa técnicas de persuasão: ele sugere e facilita, mas nunca obriga (coerção) nem
            esconde o que faz (manipulação). Aqui está cada técnica, onde ela aparece, por que está
            lá e o que você controla.
          </p>
        </section>

        <section
          id="tecnicas"
          aria-labelledby="tecnicas-titulo"
          className={`${container} flex scroll-mt-4 flex-col gap-6 pb-14`}
        >
          <h2 id="tecnicas-titulo" className="font-display text-[32px] font-semibold">
            As técnicas que usamos
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {TECNICAS.map((t) => (
              <li
                key={t.titulo}
                className="bg-surface-200 shadow-card flex flex-col gap-2 rounded-lg p-5"
              >
                <span className="self-start rounded-full bg-[color-mix(in_srgb,var(--subject-uva)_14%,var(--surface-200))] px-2.5 py-0.5 text-xs font-extrabold text-[var(--subject-uva)]">
                  {t.conceito}
                </span>
                <h3 className="text-heading">{t.titulo}</h3>
                <p>
                  <strong>Onde:</strong> {t.onde}
                </p>
                <p className="text-ink-muted">
                  <strong className="text-ink">Por quê:</strong> {t.porque}
                </p>
                <p className="bg-primary-soft mt-auto rounded-md px-3 py-2">
                  <strong>{t.controle.rotulo}:</strong> {t.controle.texto}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="nao-fazemos"
          aria-labelledby="nao-fazemos-titulo"
          className="bg-primary-soft scroll-mt-4 py-12"
        >
          <div className={`${container} flex flex-col gap-6`}>
            <h2 id="nao-fazemos-titulo" className="font-display text-[32px] font-semibold">
              O que não fazemos
            </h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-8 gap-y-4">
              {NAO_FAZEMOS.map((item) => (
                <li key={item} className="flex gap-3 text-lg">
                  <X size={22} aria-hidden className="text-primary-strong mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="experimento"
          aria-labelledby="experimento-titulo"
          className={`${container} grid scroll-mt-4 items-start gap-8 py-14 md:grid-cols-[1.1fr_1fr]`}
        >
          <div className="flex flex-col gap-4">
            <h2 id="experimento-titulo" className="font-display text-[32px] font-semibold">
              O experimento da disciplina
            </h2>
            <p className="text-lg">
              O Pomar é um projeto de Computação Persuasiva da UFAL. Queremos saber se as
              recompensas ajudam mesmo ou se as pessoas estudariam igual sem elas.
            </p>
            <ul className="flex list-disc flex-col gap-1.5 pl-6 text-lg">
              <li>No cadastro, cada pessoa é sorteada para um de dois grupos, meio a meio.</li>
              <li>
                <strong>Grupo A</strong> vê XP, emblemas, colheitas e celebrações.
              </li>
              <li>
                <strong>Grupo B</strong> usa o mesmo app sem essas recompensas visíveis. O resto é
                igual, e tudo continua sendo contado.
              </li>
              <li>
                Comparamos os dois grupos em dias de uso, pomodoros por pessoa e retorno depois de 1
                e 7 dias.
              </li>
              <li>Com poucas pessoas, o resultado é só uma demonstração, não uma prova.</li>
            </ul>
          </div>
          <QuadroDoGrupo quadro={quadro} />
        </section>

        <section
          id="seus-dados"
          aria-labelledby="dados-titulo"
          className="border-line scroll-mt-4 border-t py-14"
        >
          <div className={`${container} flex flex-col gap-6`}>
            <h2 id="dados-titulo" className="font-display text-[32px] font-semibold">
              O que registramos
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
              <div className="bg-surface-200 flex flex-col gap-2 rounded-lg p-5">
                <h3 className="text-heading">Registramos</h3>
                <p className="text-ink-muted">
                  Ações no app: abrir, começar e pausar um pomodoro, marcar tópicos, conquistas e
                  escolhas como entrar na Feira. Servem para medir o uso (pessoas ativas por dia e
                  por mês, retorno, funil do cadastro).
                </p>
              </div>
              <div className="bg-surface-200 flex flex-col gap-2 rounded-lg p-5">
                <h3 className="text-heading">Não registramos</h3>
                <p className="text-ink-muted">
                  O conteúdo do que você estuda, nada fora do Pomar e nada que identifique você além
                  da sua conta. Ninguém vê seus dados sem você deixar o perfil público.
                </p>
              </div>
              <div className="bg-surface-200 flex flex-col gap-2 rounded-lg p-5">
                <h3 className="text-heading">É seu</h3>
                <p className="text-ink-muted">
                  Baixe tudo em JSON ou exclua a conta em Configurações.{" "}
                  <Link
                    href="/privacidade"
                    className="text-primary-strong font-extrabold underline"
                  >
                    Política de privacidade
                  </Link>
                </p>
              </div>
            </div>
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
          <Link href="/" className="text-primary-strong underline underline-offset-4">
            Início
          </Link>
          <Link href="/privacidade" className="text-primary-strong underline underline-offset-4">
            Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}

/** Quadro "O SEU GRUPO" (borda `--subject-ceu`). */
function QuadroDoGrupo({ quadro }: { quadro: Quadro }) {
  const textos: Record<Quadro["kind"], { titulo: string; texto: string }> = {
    visitante: {
      titulo: "Entre para ver em qual grupo você está",
      texto: "O grupo é sorteado no cadastro e aparece aqui e nas Configurações.",
    },
    A: {
      titulo: "Você está no grupo A",
      texto:
        "Você vê XP, emblemas, colheitas e celebrações. Se sair, continua vendo tudo, e seus dados deixam de entrar na comparação.",
    },
    B: {
      titulo: "Você está no grupo B",
      texto:
        "Você não vê XP, emblemas nem colheitas, mas tudo continua sendo contado. Se sair, passa a ver tudo o que já ganhou, e seus dados deixam de entrar na comparação.",
    },
    saiu: {
      titulo: "Você saiu do experimento",
      texto: "Você saiu do experimento e agora vê todas as recompensas.",
    },
    fora: {
      titulo: "Você está fora do experimento",
      texto: "Sua conta não entra na comparação entre os grupos. Você vê todas as recompensas.",
    },
  };
  const { titulo, texto } = textos[quadro.kind];
  return (
    <div className="bg-surface-200 flex flex-col gap-3 rounded-lg border-[3px] border-[var(--subject-ceu)] p-6">
      <span className="text-caption self-start rounded-full bg-[color-mix(in_srgb,var(--subject-ceu)_12%,var(--surface-200))] px-3 py-1 text-[var(--subject-ceu)]">
        O seu grupo
      </span>
      <h3 className="text-title">{titulo}</h3>
      <p className="text-ink-muted">{texto}</p>
      {(quadro.kind === "A" || quadro.kind === "B") && (
        <LeaveExperimentButton back="/transparencia" variant="secondary" />
      )}
      {quadro.kind === "visitante" && (
        <Link
          href="/login?next=/transparencia"
          className={buttonClasses("secondary", "md", "self-start")}
        >
          Entrar
        </Link>
      )}
    </div>
  );
}
