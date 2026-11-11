import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Pomar coleta, usa e protege os seus dados.",
};

const CONTATO = "gabrielnokia10@gmail.com";
const ATUALIZADA_EM = "8 de novembro de 2026";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10 leading-relaxed">
      <Link href="/" className="self-start text-lg font-bold">
        🍅 Pomar
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-ink-muted text-sm">Atualizada em {ATUALIZADA_EM}.</p>
        <p>
          O Pomar é um app gratuito de organização de estudos com a técnica Pomodoro, desenvolvido
          como projeto acadêmico da disciplina de Computação Persuasiva da Universidade Federal de
          Alagoas (UFAL — Campus Arapiraca). Esta página explica, em linguagem simples, quais dados
          coletamos, para quê e quais são os seus direitos, de acordo com a Lei Geral de Proteção de
          Dados (LGPD — Lei nº 13.709/2018).
        </p>
      </header>

      <Secao titulo="1. Dados que coletamos">
        <ul className="flex list-disc flex-col gap-1 pl-6">
          <li>
            <strong>Conta:</strong> e-mail, nome que você escolher e, se entrar com o Google, o nome
            e a foto do seu perfil Google. Também guardamos o fuso horário do seu navegador, para
            contar seus dias de estudo corretamente.
          </li>
          <li>
            <strong>Estudos:</strong> as disciplinas, capítulos e tópicos que você cadastrar, suas
            sessões Pomodoro (início, fim, pausas), páginas lidas, ritmo de leitura e preferências
            (tempos do Pomodoro, tema, lembretes).
          </li>
          <li>
            <strong>Uso do app (telemetria):</strong> eventos como “abriu o app”, “concluiu um
            pomodoro” ou “recebeu um emblema”, com data e hora. Não registramos o conteúdo do que
            você estuda além do necessário para o funcionamento.
          </li>
        </ul>
        <p>
          Não coletamos dados sensíveis, não pedimos documentos e não pedimos dados de pagamento: o
          Pomar não vende nada.
        </p>
      </Secao>

      <Secao titulo="2. Para que usamos">
        <ul className="flex list-disc flex-col gap-1 pl-6">
          <li>
            Fazer o app funcionar: login, estimativas de tempo, progresso, XP, emblemas e ligas.
          </li>
          <li>Melhorar o app, identificando onde as pessoas têm dificuldade.</li>
          <li>
            Pesquisa acadêmica: o relatório final da disciplina apresenta{" "}
            <strong>apenas números agregados e anônimos</strong> (por exemplo, quantas pessoas
            concluíram o primeiro pomodoro). Nenhuma pessoa é identificada.
          </li>
        </ul>
        <p>
          Parte dos usuários participa de um experimento simples sobre o efeito das recompensas
          (algumas pessoas veem as animações de XP e emblemas, outras não). Você pode sair do
          experimento quando quiser.
        </p>
      </Secao>

      <Secao titulo="3. O que fica público">
        <p>
          Por padrão, nada. O perfil público e a participação nas ligas semanais são{" "}
          <strong>opcionais e começam desligados</strong>. Se você ativar, outras pessoas poderão
          ver seu nome de usuário, nível, árvore, ofensiva, emblemas e pontos da semana. Você pode
          desativar a qualquer momento.
        </p>
      </Secao>

      <Secao titulo="4. Com quem compartilhamos">
        <p>
          Não vendemos nem compartilhamos seus dados com anunciantes. Usamos apenas os serviços
          necessários para o app existir:
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-6">
          <li>
            <strong>Supabase</strong>: banco de dados e login. Os dados ficam em servidores nos
            Estados Unidos.
          </li>
          <li>
            <strong>Vercel</strong>: hospedagem do site.
          </li>
          <li>
            <strong>Google</strong>: apenas se você escolher entrar com a sua conta Google.
          </li>
        </ul>
      </Secao>

      <Secao titulo="5. Cookies e armazenamento local">
        <p>
          Usamos cookies apenas para manter você conectado. No seu navegador também guardamos um
          identificador anônimo (para entender, sem saber quem você é, se uma visita virou cadastro)
          e o estado do cronômetro, para ele não se perder se você recarregar a página. Não usamos
          cookies de publicidade.
        </p>
      </Secao>

      <Secao titulo="6. Segurança">
        <p>
          Cada pessoa só tem acesso aos próprios dados, por regras aplicadas diretamente no banco de
          dados. As conexões são criptografadas (HTTPS) e as senhas nunca são guardadas em texto
          puro.
        </p>
      </Secao>

      <Secao titulo="7. Seus direitos">
        <p>
          Você pode, a qualquer momento, acessar, corrigir, exportar ou excluir seus dados. Em
          Configurações haverá as opções <strong>Exportar meus dados</strong> e{" "}
          <strong>Excluir conta</strong>, sem etapas escondidas. Enquanto essas opções não estiverem
          disponíveis, ou para qualquer outro pedido, escreva para{" "}
          <a href={`mailto:${CONTATO}`} className="text-primary font-extrabold underline">
            {CONTATO}
          </a>
          .
        </p>
        <p>
          Ao excluir a conta, apagamos seu perfil e seus dados de estudo. Os registros de uso podem
          ser mantidos de forma anônima, sem qualquer ligação com você, apenas para as estatísticas
          agregadas.
        </p>
      </Secao>

      <Secao titulo="8. Por quanto tempo guardamos">
        <p>
          Enquanto sua conta existir. O Pomar é um projeto acadêmico: se ele for encerrado, os dados
          pessoais serão apagados.
        </p>
      </Secao>

      <Secao titulo="9. Mudanças nesta política">
        <p>
          Se esta política mudar, atualizaremos a data no topo desta página. Mudanças importantes
          serão avisadas dentro do app.
        </p>
      </Secao>

      <Secao titulo="10. Contato">
        <p>
          Dúvidas ou pedidos sobre seus dados:{" "}
          <a href={`mailto:${CONTATO}`} className="text-primary font-extrabold underline">
            {CONTATO}
          </a>
          .
        </p>
      </Secao>
    </main>
  );
}
