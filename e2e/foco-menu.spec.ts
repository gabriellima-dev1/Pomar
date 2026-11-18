/**
 * Fase 6B — Foco no menu e Início como painel (telas.md, referências 36 a 39d):
 * - menu do celular com 5 destinos (Foco no centro, sem Estatísticas) e barra lateral
 *   com 6 destinos;
 * - Foco vazio (37/37b): "Nenhuma disciplina selecionada", "Escolher disciplina",
 *   "Estudar sem disciplina" e o botão Início, sem menu;
 * - item Foco com o tempo do ciclo depois de sair do Foco (sem pausar), "Pausado" e
 *   "Colher" (39b), calculados da sessão no servidor;
 * - Início como painel: Continuar estudando, sem a lista de disciplinas, Sua semana
 *   levando às Estatísticas (39c no celular).
 */
import { expect, test, type Page } from "@playwright/test";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

const CELULAR = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

let c: Conta;
let disciplina: Awaited<ReturnType<typeof criarDisciplina>>;

const menu = (page: Page) => page.getByRole("navigation", { name: "Principal" });
const itemFoco = (page: Page) => menu(page).getByRole("link", { name: /^Foco/ });
const inicioDoFoco = (page: Page) => page.locator("a.pc-glass").filter({ hasText: "Início" });

async function limparCiclos() {
  await db().from("pomodoro_sessions").delete().eq("user_id", c.id).eq("status", "running");
}

async function cicloRodando(minutosAtras: number, pausado = false) {
  await limparCiclos();
  const inicio = Date.now() - minutosAtras * 60_000;
  return ok(
    "ciclo rodando",
    await db()
      .from("pomodoro_sessions")
      .insert({
        user_id: c.id,
        subject_id: disciplina.subjectId,
        topic_id: disciplina.topicId,
        planned_focus_sec: 1500,
        started_at: new Date(inicio).toISOString(),
        paused_at: pausado ? new Date(inicio + 7 * 60_000).toISOString() : null,
        pauses: pausado ? 1 : 0,
        status: "running",
      })
      .select("id")
      .single(),
  ).id as string;
}

test.beforeAll(async () => {
  c = await criarConta("foco");
  disciplina = await criarDisciplina(c, "Algoritmos E2E", { comCiclo: true });
});

test.afterAll(async () => {
  await apagarContas([c]);
});

test("celular: Início · Disciplinas · Foco · Liga · Conquistas, Foco no centro", async ({
  browser,
  baseURL,
}) => {
  await limparCiclos();
  const ctx = await browser.newContext({ viewport: CELULAR });
  await entrar(ctx, c, baseURL!);
  const page = await ctx.newPage();
  await page.goto("/inicio");

  const links = menu(page).getByRole("link");
  await expect(links).toHaveText(["Início", "Disciplinas", "Foco", "Liga", "Conquistas"]);
  await expect(menu(page).getByRole("link", { name: "Estatísticas" })).toHaveCount(0);
  await expect(itemFoco(page)).toHaveAttribute("aria-label", "Foco");
  await expect(itemFoco(page)).toHaveAttribute("data-estado", "idle");

  // O círculo fica no centro da barra.
  const box = await itemFoco(page).boundingBox();
  expect(Math.abs(box!.x + box!.width / 2 - CELULAR.width / 2)).toBeLessThan(4);

  // Foco sem sessão nem disciplina: sem menu, com o botão Início.
  await itemFoco(page).click();
  await expect(page).toHaveURL(/\/pomodoro$/);
  await expect(page.getByRole("heading", { name: "Nenhuma disciplina selecionada" })).toBeVisible();
  await expect(menu(page)).toHaveCount(0);
  await inicioDoFoco(page).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await ctx.close();
});

test("computador: barra lateral com 6 destinos e Configurações no pé", async ({
  browser,
  baseURL,
}) => {
  await limparCiclos();
  const ctx = await browser.newContext({ viewport: DESKTOP });
  await entrar(ctx, c, baseURL!);
  const page = await ctx.newPage();
  await page.goto("/inicio");
  await expect(menu(page).getByRole("list").getByRole("link")).toHaveText([
    "Início",
    "Disciplinas",
    "Foco",
    "Conquistas",
    "Liga",
    "Estatísticas",
  ]);
  await expect(menu(page).getByRole("link", { name: "Configurações" })).toBeVisible();
  await itemFoco(page).click();
  await expect(page.getByRole("heading", { name: "Nenhuma disciplina selecionada" })).toBeVisible();
  // A barra lateral sai do Foco (nem fica por baixo, no caminho do teclado).
  await expect(menu(page)).toHaveCount(0);
  await ctx.close();
});

for (const tela of [
  { nome: "celular", viewport: CELULAR },
  { nome: "computador", viewport: DESKTOP },
]) {
  test(`Foco vazio · ${tela.nome}: Escolher disciplina e Estudar sem disciplina`, async ({
    browser,
    baseURL,
  }) => {
    await limparCiclos();
    const ctx = await browser.newContext({ viewport: tela.viewport });
    await entrar(ctx, c, baseURL!);
    const page = await ctx.newPage();

    await page.goto("/pomodoro");
    const vazio = page.getByRole("region", { name: "Nenhuma disciplina selecionada" });
    await expect(vazio).toBeVisible();
    await expect(page.getByRole("button", { name: "Começar foco" })).toHaveCount(0);
    await expect(inicioDoFoco(page)).toBeVisible();

    await vazio.getByRole("link", { name: "Escolher disciplina" }).click();
    await expect(page).toHaveURL(/\/disciplinas$/);

    await page.goto("/pomodoro");
    await vazio.getByRole("link", { name: "Estudar sem disciplina" }).click();
    await expect(page).toHaveURL(/\/pomodoro\?livre=1$/);
    await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();
    await expect(inicioDoFoco(page)).toBeVisible();
    await ctx.close();
  });
}

test("sair do Foco não pausa: o item mostra o tempo e depois Pausado", async ({
  browser,
  baseURL,
}) => {
  await limparCiclos();
  const ctx = await browser.newContext({ viewport: CELULAR });
  await entrar(ctx, c, baseURL!);
  const page = await ctx.newPage();

  await page.goto(`/pomodoro?disciplina=${disciplina.subjectId}`);
  await page.getByRole("button", { name: "Começar foco" }).click();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  await inicioDoFoco(page).click();
  await expect(page).toHaveURL(/\/inicio$/);

  await expect(itemFoco(page)).toHaveAttribute("data-estado", "running");
  await expect(itemFoco(page)).toHaveAttribute("aria-label", /^Foco, 2[45] minutos restantes$/);
  const antes = await itemFoco(page).innerText();
  expect(antes).toMatch(/2[45]:\d\d/);
  await expect.poll(() => itemFoco(page).innerText(), { timeout: 5_000 }).not.toBe(antes);

  // A sessão continua rodando no servidor.
  const s = ok(
    "ciclo",
    await db()
      .from("pomodoro_sessions")
      .select("status, paused_at")
      .eq("user_id", c.id)
      .eq("status", "running")
      .single(),
  ) as { status: string; paused_at: string | null };
  expect(s.paused_at).toBeNull();

  // Navegar não perde o tempo; o item volta à sessão.
  await menu(page).getByRole("link", { name: "Liga" }).click();
  await expect(page).toHaveURL(/\/liga/);
  await expect(itemFoco(page)).toHaveAttribute("data-estado", "running");
  await itemFoco(page).click();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();

  // Pausado (lido do servidor): círculo claro, tempo parado e "Pausado".
  await cicloRodando(10, true);
  await page.goto("/inicio");
  await expect(itemFoco(page)).toHaveAttribute("data-estado", "paused");
  await expect(itemFoco(page)).toHaveAttribute("aria-label", "Foco, pausado");
  await expect(itemFoco(page)).toContainText("18:00");
  await expect(itemFoco(page)).toContainText("Pausado");
  await ctx.close();

  // Computador: selo com o tempo na barra lateral.
  await cicloRodando(6.3);
  const pc = await browser.newContext({ viewport: DESKTOP });
  await entrar(pc, c, baseURL!);
  const p2 = await pc.newPage();
  await p2.goto("/inicio");
  await expect(itemFoco(p2)).toHaveAttribute("aria-label", /^Foco, 1[78] minutos restantes$/);
  await expect(itemFoco(p2)).toContainText(/1[78]:\d\d/);
  await pc.close();
  await limparCiclos();
});

test("foco terminado fora do Foco: Colher abre o fim do ciclo", async ({ browser, baseURL }) => {
  await cicloRodando(25.5);
  const ctx = await browser.newContext({ viewport: CELULAR });
  await entrar(ctx, c, baseURL!);
  const page = await ctx.newPage();
  await page.goto("/inicio");
  await expect(itemFoco(page)).toHaveAttribute("data-estado", "harvest");
  await expect(itemFoco(page)).toHaveAttribute("aria-label", "Foco, fruto pronto para colher");
  await expect(itemFoco(page)).toContainText("Colher");
  await itemFoco(page).click();
  await expect(page.getByRole("dialog", { name: "Fruto colhido!" })).toBeVisible({
    timeout: 20_000,
  });
  await ctx.close();
  await limparCiclos();
});

test("Início como painel: Continuar estudando, Sua semana e sem lista de disciplinas", async ({
  browser,
  baseURL,
}) => {
  await limparCiclos();
  const ctx = await browser.newContext({ viewport: CELULAR });
  await entrar(ctx, c, baseURL!);
  const page = await ctx.newPage();
  await page.goto("/inicio");

  const continuar = page.getByRole("region", { name: "Continuar estudando" });
  await expect(continuar).toContainText("Algoritmos E2E");
  await expect(continuar).toContainText("AE"); // sigla do selo (39d)
  await expect(continuar).toContainText(disciplina.topicTitle);
  await expect(page.getByRole("heading", { name: "Suas disciplinas" })).toHaveCount(0);
  // Conquistador: o card de nível é o destaque dele (não aparece duas vezes).
  await expect(page.getByRole("heading", { name: /Rumo ao nível/ })).toHaveCount(1);

  await continuar.getByRole("link", { name: /^Começar/ }).click();
  await expect(page).toHaveURL(
    new RegExp(`/pomodoro\\?disciplina=${disciplina.subjectId}&topico=${disciplina.topicId}`),
  );
  await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();
  await inicioDoFoco(page).click();

  await continuar.getByRole("link", { name: "Trocar disciplina" }).click();
  await expect(page).toHaveURL(/\/disciplinas$/);
  await menu(page).getByRole("link", { name: "Início" }).click();

  const semana = page.getByRole("region", { name: "Sua semana" });
  await expect(semana).toContainText("pomodoros");
  // Celular: "Ver tudo →" na mesma linha do título; o nome acessível contém o texto visível.
  const verTudo = semana.getByRole("link", { name: "Ver tudo nas estatísticas", exact: true });
  await expect(verTudo).toBeVisible();
  const [titulo, link] = await Promise.all([
    semana.getByRole("heading", { name: "Sua semana" }).boundingBox(),
    verTudo.boundingBox(),
  ]);
  expect(Math.abs(titulo!.y + titulo!.height / 2 - (link!.y + link!.height / 2))).toBeLessThan(4);
  await verTudo.click();
  await expect(page).toHaveURL(/\/estatisticas$/);

  // Estatísticas no celular (39c): "← Início" no topo e Início marcado na barra.
  await expect(menu(page).getByRole("link", { name: "Início" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByRole("main").getByRole("link", { name: "Início", exact: true }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await ctx.close();
});
