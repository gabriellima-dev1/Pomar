import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Transparência",
  description: "Cada técnica de persuasão que o Pomar usa, onde ela aparece e por quê.",
};

const CONTATO = "gabrielnokia10@gmail.com";

/**
 * Versão provisória (Fase 4) da página de transparência (DESIGN §10): já lista as
 * técnicas em uso e o experimento de coortes. A versão completa, com "sair do
 * experimento", é da Fase 6.
 */
const TECNICAS: { nome: string; onde: string; porque: string }[] = [
  {
    nome: "Recompensa a cada ciclo",
    onde: "Cada pomodoro concluído colhe um fruto e dá XP.",
    porque: "Feedback imediato ajuda a manter o foco. Nada disso é comprável.",
  },
  {
    nome: "Recompensa variável",
    onde: "Todo dia com estudo rende um emblema sorteado no servidor.",
    porque:
      "A surpresa está só em qual emblema sai, nunca em se sai. Não há moedas nem caixas pagas.",
  },
  {
    nome: "Aversão à perda (ofensiva)",
    onde: "Contagem de dias seguidos com estudo.",
    porque:
      "Incentiva o hábito diário. Para não pesar, há congelamentos automáticos e mensagens sem culpa.",
  },
  {
    nome: "Nudge na pausa",
    onde: "Ao pausar, sugerimos reiniciar o ciclo.",
    porque: "Pausas quebram o foco. Pausar continua permitido e não tira nada.",
  },
  {
    nome: "Compromisso e consistência",
    onde: "Data da prova e meta diária opcionais na disciplina.",
    porque: "Declarar uma meta ajuda a cumpri-la. Tudo é opcional.",
  },
  {
    nome: "Prova social",
    onde: "Contadores reais na página inicial e a Feira (ranking semanal).",
    porque:
      "Ver outras pessoas estudando motiva. Os números são reais, sem contas de demonstração, e a Feira é opcional, sem nada pré-marcado.",
  },
  {
    nome: "Personalização (perfis de Bartle)",
    onde: "Um quiz no começo escolhe o card de destaque do Início.",
    porque: "Mostrar o que mais combina com você. Você troca ou refaz quando quiser.",
  },
  {
    nome: "Afeição (mascote)",
    onde: "O Seu Tomás comenta o seu progresso.",
    porque: "Um tom acolhedor torna o estudo mais leve. Ele nunca culpa ninguém.",
  },
];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function TransparenciaPage() {
  return (
    <main
      data-theme="classico"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10 leading-relaxed"
    >
      <Link href="/" className="self-start text-lg font-bold">
        🍅 Pomar
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Transparência</h1>
        <p>
          O Pomar é um projeto da disciplina de Computação Persuasiva (UFAL — Campus Arapiraca). Ele
          usa técnicas de persuasão para ajudar você a estudar com constância. Aqui está cada uma
          delas, onde aparece e por quê.
        </p>
      </header>

      <Secao titulo="Técnicas que usamos">
        <ul className="flex flex-col gap-4">
          {TECNICAS.map((t) => (
            <li key={t.nome} className="bg-surface-200 border-line rounded-lg border-2 p-4">
              <h3 className="font-extrabold">{t.nome}</h3>
              <p>
                <strong>Onde:</strong> {t.onde}
              </p>
              <p className="text-ink-muted">
                <strong className="text-ink">Por quê:</strong> {t.porque}
              </p>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="O que não fazemos">
        <ul className="flex list-disc flex-col gap-1 pl-6">
          <li>
            Nada é comprável: sem moedas, sem caixas-surpresa. Temas conquistados ficam para sempre.
          </li>
          <li>Pausar não tira nada.</li>
          <li>Ranking e perfil público só se você quiser, sem nada pré-marcado.</li>
          <li>Nenhum aviso não solicitado: só o aviso de fim do ciclo, se você pedir.</li>
        </ul>
      </Secao>

      <Secao titulo="Experimento de coortes">
        <p>
          Para estudar se as recompensas ajudam ou atrapalham a motivação, cada conta nova é
          sorteada para um de dois grupos. No grupo A, você vê XP, emblemas e colheitas. No grupo B,
          eles ficam escondidos (o app continua contando em segundo plano). Todo o resto é igual.
        </p>
        <p>
          Com poucas pessoas, o resultado serve como demonstração para a disciplina, não como prova
          científica. Se quiser sair do experimento, escreva para{" "}
          <a href={`mailto:${CONTATO}`} className="underline">
            {CONTATO}
          </a>
          . Em breve, dará para sair por aqui mesmo.
        </p>
      </Secao>

      <p className="text-ink-muted text-sm">
        Veja também a{" "}
        <Link href="/privacidade" className="underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </main>
  );
}
