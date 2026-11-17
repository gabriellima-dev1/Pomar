/**
 * Fase 6A — sem telas presas (PLANO › Fase 6A):
 * - fruto de ontem (telas.md › 12, revisão de 16/11): a fila não abre ao sair do
 *   pomodoro; o X (e o Esc) adia sem marcar como visto e o fruto volta ao recarregar;
 *   o cartão do Início reabre a fila; "Colher" marca como visto;
 * - onboarding (telas.md › Fluxo do onboarding, revisão de 17/11): no passo 5 o Início
 *   abre com o card "Falta 1 passo", os menus funcionam e o "Começar" volta ao pomodoro.
 */
import { expect, test, type Page } from "@playwright/test";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

const DESKTOP = { width: 1440, height: 900 };

let fruto: Conta;
let novata: Conta;
let disciplinaFruto: Awaited<ReturnType<typeof criarDisciplina>>;
let disciplinaNovata: Awaited<ReturnType<typeof criarDisciplina>>;

function diaMaceio(offset: number): string {
  const d = new Date(Date.now() - 3 * 3600_000 + offset * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Emblemas da conta com a marca de visto. */
async function emblemas(conta: Conta): Promise<{ day: string; seen_at: string | null }[]> {
  return ok(
    "emblemas",
    await db().from("user_daily_badges").select("day, seen_at").eq("user_id", conta.id),
  ) as { day: string; seen_at: string | null }[];
}

/** Marca de visto do único emblema da conta. */
async function vistoEm(conta: Conta): Promise<string | null> {
  const [emblema] = await emblemas(conta);
  if (!emblema) throw new Error("a conta não tem emblema");
  return emblema.seen_at;
}

/** Botão "Início" do pomodoro no computador (a barra lateral fica por baixo). */
function inicioDoPomodoro(page: Page) {
  return page.locator("a.pc-glass").filter({ hasText: "Início" });
}

const revelacao = (page: Page) => page.getByRole("dialog").filter({ hasText: /seu fruto de ontem/i });
const cartaoPendente = (page: Page) => page.getByRole("button", { name: /Toque para colher/ });

test.beforeAll(async () => {
  // Conta com um ciclo ontem às 19h (Maceió): ao abrir o app, o dia fecha e sai um emblema.
  fruto = await criarConta("fruto", { last_closed_day: diaMaceio(-2) });
  disciplinaFruto = await criarDisciplina(fruto, "Redes E2E");
  const inicio = new Date(`${diaMaceio(-1)}T22:00:00Z`);
  ok(
    "ciclo de ontem",
    await db()
      .from("pomodoro_sessions")
      .insert({
        user_id: fruto.id,
        subject_id: disciplinaFruto.subjectId,
        topic_id: disciplinaFruto.topicId,
        planned_focus_sec: 1500,
        started_at: inicio.toISOString(),
        ended_at: new Date(inicio.getTime() + 1500_000).toISOString(),
        status: "completed",
        pages_logged: 6,
      }),
  );

  // Conta no 1º pomodoro do onboarding (passo 5), com a disciplina já criada.
  novata = await criarConta("novata", { onboarding_step: "pomodoro" });
  disciplinaNovata = await criarDisciplina(novata, "Cálculo E2E");
});

test.afterAll(async () => {
  await apagarContas([fruto, novata]);
});

test("sair do pomodoro com fruto pendente leva ao Início sem a revelação por cima", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  await entrar(ctx, fruto, baseURL!);
  const page = await ctx.newPage();

  // Primeiro carregamento no pomodoro: o dia fecha, mas a fila não abre.
  await page.goto(`/pomodoro?disciplina=${disciplinaFruto.subjectId}`);
  await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();
  await expect(revelacao(page)).toHaveCount(0);

  await inicioDoPomodoro(page).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(cartaoPendente(page)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  expect(await emblemas(fruto)).toHaveLength(1);
  expect(await vistoEm(fruto)).toBeNull();
  await ctx.close();
});

test("o X fecha e o fruto volta ao recarregar; Esc também fecha", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  await entrar(ctx, fruto, baseURL!);
  const page = await ctx.newPage();

  await page.goto("/inicio");
  await expect(revelacao(page)).toBeVisible();
  await page.getByRole("button", { name: "Fechar e ver depois" }).click();
  await expect(revelacao(page)).toHaveCount(0);
  await expect(cartaoPendente(page)).toBeVisible();
  expect(await vistoEm(fruto)).toBeNull();

  await page.reload();
  await expect(revelacao(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(revelacao(page)).toHaveCount(0);
  expect(await vistoEm(fruto)).toBeNull();
  await ctx.close();
});

test("o cartão do Início reabre a fila e Colher marca como visto", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  await entrar(ctx, fruto, baseURL!);
  const page = await ctx.newPage();

  await page.goto("/inicio");
  await expect(revelacao(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(revelacao(page)).toHaveCount(0);

  await cartaoPendente(page).click();
  await expect(revelacao(page)).toBeVisible();
  await revelacao(page).getByRole("button", { name: "Colher" }).click();
  await expect(revelacao(page)).toHaveCount(0);
  await expect.poll(() => vistoEm(fruto)).not.toBeNull();
  // O cartão volta a ser o link do álbum.
  await expect(cartaoPendente(page)).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("link", { name: /Fruto de ontem/ })).toBeVisible();
  await expect(revelacao(page)).toHaveCount(0);
  await ctx.close();
});

test("no passo 5 do onboarding, o Início abre com o card e os menus funcionam", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  await entrar(ctx, novata, baseURL!);
  const page = await ctx.newPage();

  await page.goto(`/pomodoro?disciplina=${disciplinaNovata.subjectId}`);
  await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();
  await inicioDoPomodoro(page).click();
  await expect(page).toHaveURL(/\/inicio$/);
  const card = page.getByRole("region", { name: "Colha seu primeiro fruto" });
  await expect(card).toBeVisible();
  await expect(card.getByText("Falta 1 passo")).toBeVisible();
  await expect(card.getByText("Um pomodoro em Cálculo E2E")).toBeVisible();

  // Barra lateral: nenhum destino redireciona de volta ao pomodoro.
  const menu = page.getByRole("navigation", { name: "Principal" });
  for (const [nome, rota] of [
    ["Disciplinas", "/disciplinas"],
    ["Conquistas", "/conquistas"],
    ["Liga", "/liga"],
    ["Estatísticas", "/estatisticas"],
    ["Início", "/inicio"],
  ] as const) {
    await menu.getByRole("link", { name: nome }).click();
    await expect(page).toHaveURL(new RegExp(`${rota}$`));
  }

  await card.getByRole("link", { name: "Começar" }).click();
  await expect(page).toHaveURL(new RegExp(`/pomodoro\\?disciplina=${disciplinaNovata.subjectId}`));
  await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();

  // O passo não muda só por navegar (os eventos do funil continuam iguais).
  const perfil = ok(
    "perfil",
    await db().from("profiles").select("onboarding_step").eq("id", novata.id).single(),
  ) as { onboarding_step: string };
  expect(perfil.onboarding_step).toBe("pomodoro");
  await ctx.close();

  // Celular: o Início do passo 5 tem a navegação inferior.
  const cel = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await entrar(cel, novata, baseURL!);
  const p2 = await cel.newPage();
  await p2.goto("/inicio");
  await expect(p2.getByRole("region", { name: "Colha seu primeiro fruto" })).toBeVisible();
  await expect(p2.getByRole("navigation", { name: "Principal" })).toBeVisible();
  await cel.close();
});

test("o Início ainda leva ao passo antes da 1ª disciplina e no primeiro fruto", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, novata, baseURL!);
  for (const [passo, rota] of [
    ["calibracao", `/disciplinas/${disciplinaNovata.subjectId}/calibrar`],
    ["primeiro_fruto", "/onboarding/primeiro-fruto"],
  ] as const) {
    ok(
      "passo",
      await db().from("profiles").update({ onboarding_step: passo }).eq("id", novata.id),
    );
    await page.goto("/inicio");
    await expect(page).toHaveURL(new RegExp(`${rota}$`));
  }
});
