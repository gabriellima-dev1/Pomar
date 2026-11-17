/**
 * Painel /admin (tela 34, DESIGN §9.3): só `is_admin` vê; os outros recebem 404 e quem
 * não entrou vai para o login. Os números vêm do banco real, então o teste confere a
 * estrutura (cartões, funil, gráfico, experimento, nudge) e os filtros.
 */
import { expect, test } from "@playwright/test";
import { apagarContas, criarConta, entrar, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

let admin: Conta;
let comum: Conta;

test.beforeAll(async () => {
  admin = await criarConta("adm", { is_admin: true });
  comum = await criarConta("nadm");
});

test.afterAll(async () => {
  await apagarContas([admin, comum]);
});

test("sem login vai para o login; sem is_admin recebe 404", async ({ browser, baseURL }) => {
  const anon = await browser.newContext();
  const p1 = await anon.newPage();
  await p1.goto("/admin");
  await expect(p1).toHaveURL(/\/login\?next=%2Fadmin/);
  await anon.close();

  const ctx = await browser.newContext();
  await entrar(ctx, comum, baseURL!);
  const p2 = await ctx.newPage();
  const res = await p2.goto("/admin");
  expect(res?.status()).toBe(404);
  await expect(p2.getByText("Painel do Pomar")).toHaveCount(0);
  await ctx.close();
});

test("admin vê os cartões, o funil, o gráfico, o experimento e o nudge", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, admin, baseURL!);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Painel do Pomar" })).toBeVisible();
  for (const c of ["DAU", "MAU", "Stickiness", "Retenção D1", "Retenção D7", "Nudge da pausa"]) {
    await expect(page.getByText(c, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Funil do onboarding" })).toBeVisible();
  await expect(page.locator("ol li")).toHaveCount(6);
  await expect(page.getByRole("img", { name: /Ativos por dia/ })).toBeVisible();
  await expect(page.getByText("Amostra pequena: resultado demonstrativo")).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Retenção D7" })).toBeVisible();
  await expect(page.getByText(/pop-ups exibidos no período/)).toBeVisible();
  await expect(page.getByText(/contas? demo/).last()).toBeVisible();
});

test("filtros: período e contas demo", async ({ page, context, baseURL }) => {
  await entrar(context, admin, baseURL!);
  await page.goto("/admin");
  const periodo = page.getByRole("navigation", { name: "Período" });
  await expect(periodo.getByRole("link", { name: "30 dias" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await periodo.getByRole("link", { name: "7 dias" }).click();
  await expect(page).toHaveURL(/periodo=7/);
  await expect(periodo.getByRole("link", { name: "7 dias" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("img", { name: /Ativos por dia/ })).toBeVisible();

  const demo = page.getByRole("checkbox", { name: "Sem contas demo" });
  await expect(demo).toHaveAttribute("aria-checked", "true");
  await demo.click();
  await expect(page).toHaveURL(/demo=1/);
  await expect(page.getByRole("checkbox", { name: "Sem contas demo" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(page.getByText(/estão incluídas nestes números/)).toBeVisible();
});

test("no celular tudo empilha, sem rolagem horizontal", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await entrar(ctx, admin, baseURL!);
  const page = await ctx.newPage();
  await page.goto("/admin?periodo=tudo&demo=1");
  await expect(page.getByRole("heading", { name: "Painel do Pomar" })).toBeVisible();
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(390);
  await ctx.close();
});
