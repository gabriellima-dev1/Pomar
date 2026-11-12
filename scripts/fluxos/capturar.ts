/**
 * Captura os fluxos de telas das personas (docs/fluxos/PLANO.md) no app real, no
 * celular (390×844) e no computador (1440×900), com o Chrome instalado (Playwright).
 *
 * Uso: npm run build && npx next start -p 3100     (em outro terminal)
 *      npm run fluxos:preparar -- --confirmo
 *      npm run fluxos:capturar                     (FLUXOS_URL muda o endereço)
 *
 * Saída em .fluxos/: capturas/<persona>/<nn>-<passo>-<tela>.png e roteiro.json (para
 * a galeria). Alguns passos mudam o estado das contas de exemplo (marcam revelações
 * como vistas, criam ciclos); por isso a ordem importa e cada captura recomeça do
 * `preparar`.
 */
import { createClient } from "@supabase/supabase-js";
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { addDays, localDay, weekStart } from "../../lib/dates.ts";
import {
  PASTA,
  PERSONAS,
  TZ,
  admin,
  env,
  idsDasContas,
  lerSenhas,
  must,
  type PersonaId,
} from "./comum.ts";

const BASE = process.env.FLUXOS_URL ?? "http://localhost:3100";
const TELAS = {
  celular: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  computador: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
} as const;
type Tela = keyof typeof TELAS;

const db = admin();
const ids = await idsDasContas(db);
const uid = Object.fromEntries(
  (Object.keys(PERSONAS) as PersonaId[]).map((k) => [k, ids.get(PERSONAS[k].email)]),
) as Record<PersonaId, string | undefined>;
if (Object.values(uid).some((v) => !v)) {
  console.error(
    "Contas de exemplo não encontradas. Rode antes: npm run fluxos:preparar -- --confirmo",
  );
  process.exit(1);
}
const U = uid as Record<PersonaId, string>;
const senhas = lerSenhas();
const today = localDay(new Date(), TZ);
const monday = weekStart(today);
const lastMonday = addDays(monday, -7);

// Dados que os passos usam ------------------------------------------------------------
const carlaSubject = must(
  "disciplina da Carla",
  await db.from("subjects").select("id").eq("user_id", U.carla).single(),
).id as string;

async function nextTopic(subjectId: string): Promise<string | null> {
  const chapters = must(
    "capítulos",
    await db
      .from("chapters")
      .select("position, topics(id, position, done_at)")
      .eq("subject_id", subjectId)
      .order("position"),
  ) as { position: number; topics: { id: string; position: number; done_at: string | null }[] }[];
  for (const c of chapters) {
    const t = [...c.topics].sort((a, b) => a.position - b.position).find((x) => !x.done_at);
    if (t) return t.id;
  }
  return null;
}

async function cicloRodando(persona: PersonaId, minutosAtras: number) {
  must(
    "limpar ciclo",
    await db.from("pomodoro_sessions").delete().eq("user_id", U[persona]).eq("status", "running"),
  );
  must(
    "ciclo rodando",
    await db.from("pomodoro_sessions").insert({
      user_id: U[persona],
      subject_id: carlaSubject,
      topic_id: await nextTopic(carlaSubject),
      planned_focus_sec: 1500,
      started_at: new Date(Date.now() - minutosAtras * 60_000).toISOString(),
      status: "running",
    }),
  );
}

async function marcarRevelacoesVistas(persona: PersonaId) {
  const now = new Date().toISOString();
  must(
    "emblemas vistos",
    await db.from("user_daily_badges").update({ seen_at: now }).eq("user_id", U[persona]),
  );
  must(
    "temas vistos",
    await db
      .from("user_themes")
      .update({ seen_at: now, tab_seen_at: now })
      .eq("user_id", U[persona]),
  );
  const p = must(
    "nível",
    await db.from("profiles").select("level").eq("id", U[persona]).single(),
  ) as { level: number };
  must(
    "nível visto",
    await db.from("profiles").update({ level_seen: p.level }).eq("id", U[persona]),
  );
}

async function resultadoDoDiego(division: string, outcome: string, rank: number, xp: number) {
  const row = must(
    "resultado",
    await db
      .from("league_members")
      .select("group_id")
      .eq("user_id", U.diego)
      .eq("week_start", lastMonday)
      .single(),
  ) as { group_id: string };
  must(
    "divisão do grupo",
    await db.from("league_groups").update({ division }).eq("id", row.group_id),
  );
  must(
    "saída",
    await db
      .from("league_members")
      .update({ outcome, final_rank: rank, xp_week: xp, result_seen_at: null })
      .eq("user_id", U.diego)
      .eq("week_start", lastMonday),
  );
}

// Roteiro -------------------------------------------------------------------------------

type Passo = {
  persona: PersonaId;
  id: string;
  titulo: string;
  /** O que a pessoa fez para chegar aqui. */
  acao: string;
  /** Regra que vale nesta tela (com a referência). */
  regra: string;
  /** Pontos em aberto para a dupla decidir. */
  decisoes?: string[];
  url: () => string | Promise<string>;
  /** Sem login (visitante). */
  semLogin?: boolean;
  /** Captura só a área visível (telas em tela cheia). */
  visivel?: boolean;
  /** Uma vez, antes das capturas (com uma página logada, para "aquecer"). */
  preparar?: (page: Page) => Promise<void>;
  /** Antes de cada tela (celular e computador), para as duas verem o mesmo estado. */
  antes?: () => Promise<void>;
  /** Depois de carregar, antes da captura. */
  interagir?: (page: Page) => Promise<void>;
  /** Uma vez, depois das duas capturas. */
  depois?: () => Promise<void>;
};

const PASSOS: Passo[] = [
  // Carla ---------------------------------------------------------------------------------
  {
    persona: "carla",
    id: "fruto-de-ontem",
    titulo: "Fruto de ontem",
    acao: "Abriu o app depois de alguns dias estudando.",
    regra:
      "O fechamento dos dias acontece ao abrir o app: cada dia com pomodoro rende 1 emblema sorteado no servidor, revelado um por vez (DESIGN §6.4, tela 12).",
    decisoes: [
      "Com vários dias sem abrir, aparecem até 7 revelações seguidas. Mostrar todas ou só a mais recente e um resumo?",
    ],
    url: () => "/inicio",
    visivel: true,
    depois: async () => {
      const now = new Date().toISOString();
      must(
        "emblemas vistos",
        await db.from("user_daily_badges").update({ seen_at: now }).eq("user_id", U.carla),
      );
    },
  },
  {
    persona: "carla",
    id: "tema-desbloqueado",
    titulo: "Tema desbloqueado",
    acao: "Tocou em Colher no último fruto.",
    regra:
      "A 1ª Colheita de Prata desbloqueia o tema Halloween, para sempre (DESIGN §6.7, tela 14).",
    url: () => "/inicio",
    visivel: true,
    depois: async () => {
      const now = new Date().toISOString();
      must(
        "temas vistos",
        await db.from("user_themes").update({ seen_at: now }).eq("user_id", U.carla),
      );
    },
  },
  {
    persona: "carla",
    id: "subiu-de-nivel",
    titulo: "Subiu de nível",
    acao: "Tocou em Depois no tema.",
    regra:
      "A celebração em tela cheia só aparece quando a árvore muda de estágio (níveis 3, 6, 10 e 15); nos outros níveis, um aviso curto (tela 13).",
    url: () => "/inicio",
    visivel: true,
    depois: () => marcarRevelacoesVistas("carla"),
  },
  {
    persona: "carla",
    id: "inicio",
    titulo: "Início",
    acao: "Fechou a celebração.",
    regra:
      "Destaque do perfil Conquistador: rumo ao próximo nível, meta do dia e colheita da semana. O card da disciplina leva ao próximo tópico em 1 toque (DESIGN §4.4 e §6.8).",
    url: () => "/inicio",
  },
  {
    persona: "carla",
    id: "disciplina",
    titulo: "Disciplina",
    acao: "Tocou no card de Algoritmos.",
    regra:
      "O próximo tópico é sempre o primeiro não concluído, na ordem do livro. O tópico só fica concluído quando a pessoa marca (aqui ou no fim do ciclo).",
    decisoes: [
      'Hoje não dá para estudar um tópico fora da ordem. Tocar num tópico para abrir "Estudar este tópico"?',
    ],
    url: () => `/disciplinas/${carlaSubject}`,
  },
  {
    persona: "carla",
    id: "pomodoro-pronto",
    titulo: "Pomodoro pronto",
    acao: "Tocou em Começar pomodoro.",
    regra: "Padrão 25/5/15, ajustável de 5 em 5 (DESIGN §4.5). A cena muda com o tema e o nível.",
    url: () => `/pomodoro?disciplina=${carlaSubject}`,
    visivel: true,
  },
  {
    persona: "carla",
    id: "pomodoro-rodando",
    titulo: "Foco em andamento",
    acao: "Tocou em Começar foco (10 minutos atrás).",
    regra:
      "O cronômetro usa os horários de início e pausa: continua com a aba oculta e sobrevive a recarregar. O fruto amadurece com o progresso.",
    url: () => "/pomodoro",
    visivel: true,
    antes: () => cicloRodando("carla", 10),
  },
  {
    persona: "carla",
    id: "pausa",
    titulo: "Pausa com nudge",
    acao: "Tocou em Pausar.",
    regra:
      'Pausar não pune: só abre o convite para reiniciar o ciclo, com "Reiniciar" em destaque (DESIGN §4.5).',
    url: () => "/pomodoro",
    visivel: true,
    antes: () => cicloRodando("carla", 10),
    interagir: async (page) => {
      await page.getByRole("button", { name: "Pausar" }).click();
      await page.getByText("Pausas quebram o foco").waitFor();
    },
    depois: async () => {
      must(
        "limpar ciclo",
        await db.from("pomodoro_sessions").delete().eq("user_id", U.carla).eq("status", "running"),
      );
    },
  },
  {
    persona: "carla",
    id: "fim-do-ciclo",
    titulo: "Fim do ciclo",
    acao: "Esperou os 25 minutos.",
    regra:
      "O ciclo só conta com 90% do foco planejado. As páginas começam no previsto e recalibram o ritmo; o XP vem do servidor.",
    decisoes: [
      "A caixa de concluir o tópico vem desmarcada mesmo quando as páginas lidas chegam ao fim dele. Vir marcada nesses casos?",
    ],
    url: () => "/pomodoro",
    visivel: true,
    antes: () => cicloRodando("carla", 25.7),
    interagir: async (page) => {
      await page.getByText("Fruto colhido!").first().waitFor({ timeout: 20_000 });
    },
  },
  {
    persona: "carla",
    id: "conquistas-emblemas",
    titulo: "Conquistas · Emblemas",
    acao: "Abriu Conquistas.",
    regra:
      "Álbum com os 11 emblemas; os ocultos aparecem como silhueta até sair (DESIGN §6.4, tela 09).",
    url: () => "/conquistas",
  },
  {
    persona: "carla",
    id: "conquistas-colheitas",
    titulo: "Conquistas · Colheitas",
    acao: "Tocou em Colheitas.",
    regra:
      "3–4 dias com emblema = Bronze, 5–6 = Prata, 7 = Ouro, semana de segunda a domingo (§6.5).",
    url: () => "/conquistas?aba=colheitas",
  },
  {
    persona: "carla",
    id: "conquistas-temas",
    titulo: "Conquistas · Temas",
    acao: "Tocou em Temas.",
    regra: "Temas conquistados ficam para sempre; nada é comprável (§6.7).",
    url: () => "/conquistas?aba=temas",
  },
  {
    persona: "carla",
    id: "estatisticas-semana",
    titulo: "Estatísticas · Semana",
    acao: "Abriu Estatísticas.",
    regra:
      "Tudo no fuso da pessoa e só com ciclos concluídos; iguais para as duas coortes (§4.6, DECISOES 11/11).",
    url: () => "/estatisticas",
  },
  {
    persona: "carla",
    id: "estatisticas-mes",
    titulo: "Estatísticas · Mês",
    acao: "Tocou em Mês.",
    regra: "Barras por semana do mês; comparação neutra com o mês anterior.",
    url: () => "/estatisticas?p=mes",
  },

  // Diego ---------------------------------------------------------------------------------
  {
    persona: "diego",
    id: "feira",
    titulo: "Liga · Feira",
    acao: "Abriu a Liga.",
    regra:
      "Só aparece no ranking quem ganhou XP na semana (como no Duolingo). Com 10+, os 5 primeiros sobem e os 5 últimos descem; Bronze não desce (DESIGN §6.6, DECISOES 12/11).",
    decisoes: ['O grupo de exemplo é de contas demo (selo "demo"); na Feira real o selo some.'],
    url: () => "/liga?aba=feira",
    preparar: async (page) => {
      await page.goto(`${BASE}/inicio`);
      await page.waitForLoadState("networkidle");
      await marcarRevelacoesVistas("diego");
      must(
        "resultado visto",
        await db
          .from("league_members")
          .update({ result_seen_at: new Date().toISOString() })
          .eq("user_id", U.diego)
          .eq("week_start", lastMonday),
      );
    },
  },
  {
    persona: "diego",
    id: "feira-grupo-todo",
    titulo: "Liga · Feira (grupo todo)",
    acao: "Tocou em Ver o grupo todo.",
    regra: "Por padrão, até 8 linhas em volta da pessoa; aqui, o grupo inteiro com as duas zonas.",
    url: () => "/liga?aba=feira&todos=1",
  },
  {
    persona: "diego",
    id: "inicio-competidor",
    titulo: "Início · destaque do Competidor",
    acao: "Voltou ao Início.",
    regra:
      "Perfil Competidor: posição, distância para quem está à frente e a zona de subida (§6.8).",
    url: () => "/inicio",
  },
  {
    persona: "diego",
    id: "resultado-subiu",
    titulo: "Resultado da semana · subiu",
    acao: "Abriu o app na segunda depois do fechamento.",
    regra: "Aparece uma vez. Raios e a medalha da nova divisão (tela 25).",
    url: () => "/inicio",
    visivel: true,
    antes: () => resultadoDoDiego("bronze", "up", 4, 230),
  },
  {
    persona: "diego",
    id: "resultado-ficou",
    titulo: "Resultado da semana · ficou",
    acao: "Mesma situação, terminando no meio do grupo.",
    regra: '"Semana nova, todo mundo começa do zero."',
    url: () => "/inicio",
    visivel: true,
    antes: () => resultadoDoDiego("prata", "stay", 7, 120),
  },
  {
    persona: "diego",
    id: "resultado-desceu",
    titulo: "Resultado da semana · desceu",
    acao: "Mesma situação, terminando entre os últimos.",
    regra: 'Sem raios e sem "rebaixado" ou "perdeu": mensagem acolhedora (CLAUDE.md › Interface).',
    url: () => "/inicio",
    visivel: true,
    antes: () => resultadoDoDiego("prata", "down", 12, 15),
    depois: async () => {
      must(
        "resultado visto",
        await db
          .from("league_members")
          .update({ result_seen_at: new Date().toISOString() })
          .eq("user_id", U.diego)
          .eq("week_start", lastMonday),
      );
    },
  },

  // Elisa ---------------------------------------------------------------------------------
  {
    persona: "elisa",
    id: "apelido",
    titulo: "Escolha seu apelido",
    acao: "Abriu a Liga pela primeira vez.",
    regra:
      'O apelido é o que aparece na Feira e entre amigos. "Deixar meu perfil público" vem desmarcado (DESIGN §10, tela 24).',
    url: () => "/liga",
    preparar: async (page) => {
      await page.goto(`${BASE}/inicio`);
      await page.waitForLoadState("networkidle");
      await marcarRevelacoesVistas("elisa");
    },
    depois: async () => {
      must(
        "apelido",
        await db
          .from("profiles")
          .update({ username: PERSONAS.elisa.apelido, public_profile: true })
          .eq("id", U.elisa),
      );
    },
  },
  {
    persona: "elisa",
    id: "feira-sem-xp",
    titulo: "Feira sem XP na semana",
    acao: "Salvou o apelido e voltou para a Feira.",
    regra:
      "Quem ainda não ganhou XP na semana não entra no ranking nem sobe ou desce (DECISOES 12/11).",
    url: () => "/liga?aba=feira",
  },
  {
    persona: "elisa",
    id: "amigos-sem-seguir",
    titulo: "Amigos (ainda sem seguir ninguém)",
    acao: "Tocou em Amigos.",
    regra:
      "A faixa mostra os parabéns recebidos desde a última visita; o feed só tem conquistas de quem ela segue (tela 26).",
    url: () => "/liga?aba=amigos",
    antes: async () => {
      must(
        "parabéns novos",
        await db.from("profiles").update({ reactions_seen_at: null }).eq("id", U.elisa),
      );
    },
  },
  {
    persona: "elisa",
    id: "buscar",
    titulo: "Buscar pessoas",
    acao: 'Tocou em Buscar e digitou "carla".',
    regra: "Busca pelo começo do apelido, a partir de 2 letras; só perfis públicos (tela 27).",
    url: () => "/liga/buscar",
    interagir: async (page) => {
      await page.getByPlaceholder("Buscar pessoas pelo apelido").fill("carla");
      await page.getByText("@carla.exemplo").first().waitFor();
    },
  },
  {
    persona: "elisa",
    id: "seguindo",
    titulo: "Seguindo",
    acao: "Tocou em Seguir.",
    regra:
      'Seguir só perfis públicos; "Seguindo" pede confirmação para deixar de seguir (tela 27).',
    url: () => "/liga/buscar",
    antes: async () => {
      must(
        "deixar de seguir",
        await db.from("follows").delete().eq("follower_id", U.elisa).eq("followee_id", U.carla),
      );
    },
    interagir: async (page) => {
      await page.getByPlaceholder("Buscar pessoas pelo apelido").fill("carla");
      await page.getByRole("button", { name: "Seguir @carla.exemplo" }).click();
      await page.getByRole("button", { name: /Seguindo @carla.exemplo/ }).waitFor();
    },
    depois: async () => {
      must(
        "seguir",
        await db.from("follows").upsert(
          [
            { follower_id: U.elisa, followee_id: U.carla },
            { follower_id: U.elisa, followee_id: U.diego },
          ],
          { onConflict: "follower_id,followee_id", ignoreDuplicates: true },
        ),
      );
    },
  },
  {
    persona: "elisa",
    id: "amigos-feed",
    titulo: "Amigos · conquistas de quem segue",
    acao: "Seguiu a Carla e o Diego e voltou para Amigos.",
    regra:
      "Só conquistas marcantes, até 14 dias: colheita, estágio da árvore, emblema raro, capítulo ou disciplina concluída, subida de divisão (DECISOES 11/11).",
    decisoes: ['O feed mostra o nome da disciplina ("capítulo 1 de Algoritmos"). Manter?'],
    url: () => "/liga?aba=amigos",
    antes: async () => {
      must(
        "parabéns novos",
        await db.from("profiles").update({ reactions_seen_at: null }).eq("id", U.elisa),
      );
      must("limpar parabéns enviados", await db.from("reactions").delete().eq("user_id", U.elisa));
    },
  },
  {
    persona: "elisa",
    id: "parabens-enviado",
    titulo: "Parabéns enviado",
    acao: "Tocou em Parabéns na primeira conquista.",
    regra: "Um parabéns por pessoa por conquista, sem desfazer.",
    url: () => "/liga?aba=amigos",
    antes: async () => {
      must("limpar parabéns enviados", await db.from("reactions").delete().eq("user_id", U.elisa));
    },
    interagir: async (page) => {
      await page
        .getByRole("button", { name: /Dar parabéns/ })
        .first()
        .click();
      await page.getByText("Enviado").first().waitFor();
    },
  },
  {
    persona: "elisa",
    id: "perfil-publico",
    titulo: "Perfil público (logada)",
    acao: "Tocou no apelido da Carla.",
    regra:
      "Nível, árvore, ofensiva, emblemas e conquistas recentes; nada de disciplinas, horas ou páginas (tela 28).",
    url: () => `/perfil/${PERSONAS.carla.apelido}`,
  },
  {
    persona: "elisa",
    id: "perfil-sem-login",
    titulo: "Perfil público (sem login)",
    acao: "Alguém abriu o link do perfil sem ter conta.",
    regra: "Como no Duolingo, abre pelo link; não entra em buscadores (DECISOES 12/11).",
    url: () => `/perfil/${PERSONAS.carla.apelido}`,
    semLogin: true,
  },
  {
    persona: "elisa",
    id: "perfil-privado",
    titulo: "Perfil privado",
    acao: "Abriu o link de um perfil não público.",
    regra: '"Este perfil é privado", sem nenhum dado.',
    url: () => "/perfil/nina.b",
  },
  {
    persona: "elisa",
    id: "inicio-socializadora",
    titulo: "Início · destaque da Socializadora",
    acao: "Voltou ao Início.",
    regra: "Perfil Socializador: parabéns novos e prévia do feed de quem segue (§6.8).",
    url: () => "/inicio",
  },
];

// Execução -------------------------------------------------------------------------------

async function cookies(persona: PersonaId) {
  const anon = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  const { data, error } = await anon.auth.signInWithPassword({
    email: PERSONAS[persona].email,
    password: senhas[persona] ?? "",
  });
  if (error || !data.session) throw new Error(`login ${persona}: ${error?.message}`);
  const ref = new URL(env("NEXT_PUBLIC_SUPABASE_URL")).hostname.split(".")[0];
  const value = `base64-${Buffer.from(JSON.stringify(data.session)).toString("base64url")}`;
  const name = `sb-${ref}-auth-token`;
  const host = new URL(BASE).hostname;
  const CHUNK = 3180;
  if (value.length <= CHUNK) return [{ name, value, domain: host, path: "/" }];
  const parts = [];
  for (let i = 0; i * CHUNK < value.length; i++) {
    parts.push({
      name: `${name}.${i}`,
      value: value.slice(i * CHUNK, (i + 1) * CHUNK),
      domain: host,
      path: "/",
    });
  }
  return parts;
}

async function contexto(
  browser: Browser,
  tela: Tela,
  persona: PersonaId | null,
): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    viewport: { width: TELAS[tela].width, height: TELAS[tela].height },
    deviceScaleFactor: TELAS[tela].deviceScaleFactor,
    isMobile: TELAS[tela].isMobile,
    hasTouch: TELAS[tela].hasTouch,
    locale: "pt-BR",
    timezoneId: TZ,
  });
  if (persona) await ctx.addCookies(await cookies(persona));
  return ctx;
}

const saida = join(PASTA, "capturas");
rmSync(saida, { recursive: true, force: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const roteiro: (Omit<Passo, "url" | "preparar" | "antes" | "interagir" | "depois"> & {
  n: number;
  caminho: string;
  imagens: Record<Tela, string>;
})[] = [];
const contador: Record<PersonaId, number> = { carla: 0, diego: 0, elisa: 0 };

for (const passo of PASSOS) {
  const n = ++contador[passo.persona];
  const prefixo = `${String(n).padStart(2, "0")}-${passo.id}`;
  mkdirSync(join(saida, passo.persona), { recursive: true });
  if (passo.preparar) {
    const ctx = await contexto(browser, "computador", passo.persona);
    await passo.preparar(await ctx.newPage());
    await ctx.close();
  }
  const caminho = await passo.url();
  const imagens = {} as Record<Tela, string>;
  for (const tela of Object.keys(TELAS) as Tela[]) {
    await passo.antes?.();
    const ctx = await contexto(browser, tela, passo.semLogin ? null : passo.persona);
    const page = await ctx.newPage();
    await page.goto(`${BASE}${caminho}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    await passo.interagir?.(page);
    await page.waitForTimeout(600);
    const arquivo = join(passo.persona, `${prefixo}-${tela}.png`);
    if (!passo.visivel) {
      // Página inteira: a tela cresce até a altura do conteúdo, para as barras fixas
      // (navegação, rodapé) ficarem no fim da imagem e não no meio.
      const altura = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({
        width: TELAS[tela].width,
        height: Math.max(altura, TELAS[tela].height),
      });
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: join(saida, arquivo) });
    imagens[tela] = arquivo;
    await ctx.close();
  }
  await passo.depois?.();
  roteiro.push({
    persona: passo.persona,
    id: passo.id,
    titulo: passo.titulo,
    acao: passo.acao,
    regra: passo.regra,
    decisoes: passo.decisoes,
    semLogin: passo.semLogin,
    visivel: passo.visivel,
    n,
    caminho,
    imagens,
  });
  console.log(`✓ ${passo.persona} ${prefixo}`);
}
await browser.close();

// As personas saem da Feira para não entrarem nos grupos reais na próxima segunda.
must(
  "sair da Feira",
  await db.from("profiles").update({ league_opt_in: false }).in("id", Object.values(U)),
);

writeFileSync(
  join(PASTA, "roteiro.json"),
  `${JSON.stringify({ geradoEm: new Date().toISOString(), base: BASE, passos: roteiro }, null, 2)}\n`,
);
console.log(`\n${roteiro.length} passos, ${roteiro.length * 2} capturas em .fluxos/capturas.`);
