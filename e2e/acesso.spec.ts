/**
 * Entrada no app: login pela tela (e-mail e senha) e proteção das rotas logadas.
 */
import { expect, test } from "@playwright/test";
import { apagarContas, criarConta, type Conta } from "./apoio";

let c: Conta;

test.beforeAll(async () => {
  c = await criarConta("login");
});

test.afterAll(async () => {
  await apagarContas([c]);
});

test("rota logada sem sessão vai para o login e volta depois de entrar", async ({ page }) => {
  await page.goto("/estatisticas");
  await expect(page).toHaveURL(/\/login\?next=%2Festatisticas/);
  await page.getByLabel("E-mail").fill(c.email);
  await page.getByLabel("Senha").fill(c.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/estatisticas$/);
  await expect(page.getByRole("heading", { name: "Estatísticas" })).toBeVisible();
});

test("senha errada mostra o erro e não entra", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(c.email);
  await page.getByLabel("Senha").fill("senha-errada-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
