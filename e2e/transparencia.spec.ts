/**
 * Transparência (tela 33, DESIGN §10) e o limite prometido no card "XP, níveis e a árvore":
 * - visitante vê as 12 técnicas, "O que não fazemos" e "Entre para ver em qual grupo";
 * - grupo B vê o próprio grupo e sai do experimento por aqui;
 * - conta antiga (de antes do sorteio) entra no experimento como grupo A;
 * - a partir do nível 10, o Início destaca os tópicos concluídos e o XP fica discreto.
 */
import { expect, test } from "@playwright/test";
import { xpForLevel } from "../lib/gamification/levels";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

let b: Conta;
let antiga: Conta;
let mestre: Conta;

test.beforeAll(async () => {
  b = await criarConta("trb");
  ok("coorte B", await db().from("user_cohorts").update({ cohort: "B" }).eq("user_id", b.id));
  antiga = await criarConta("trl");
  ok("legado", await db().from("user_cohorts").update({ legacy: true }).eq("user_id", antiga.id));
  mestre = await criarConta("trm", { level: 10, level_seen: 10, xp_total: xpForLevel(10) + 5 });
  const d = await criarDisciplina(mestre, "Grafos E2E", { comCiclo: true });
  ok(
    "tópico concluído",
    await db().from("topics").update({ done_at: new Date().toISOString() }).eq("id", d.topicId),
  );
});

test.afterAll(async () => {
  await apagarContas([b, antiga, mestre]);
});

test("visitante vê as técnicas, o que não fazemos e o convite para entrar", async ({ page }) => {
  await page.goto("/transparencia");
  await expect(
    page.getByRole("heading", { name: "Como o Pomar tenta te convencer a estudar" }),
  ).toBeVisible();
  await expect(page.locator("#tecnicas li")).toHaveCount(12);
  await expect(page.locator("#nao-fazemos li")).toHaveCount(6);
  for (const ancora of ["Técnicas", "O que não fazemos", "Experimento", "Seus dados"]) {
    await expect(page.getByRole("link", { name: ancora, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Entre para ver em qual grupo você está")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sair do experimento" })).toHaveCount(0);
});

test("grupo B vê o próprio grupo e sai do experimento pela Transparência", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, b, baseURL!);
  await page.goto("/transparencia");
  await expect(page.getByRole("heading", { name: "Você está no grupo B" })).toBeVisible();
  await page.getByRole("button", { name: "Sair do experimento" }).click();
  const dialogo = page.getByRole("dialog", { name: "Sair do experimento?" });
  await dialogo.getByRole("button", { name: "Sair do experimento" }).click();
  await expect(page.getByRole("heading", { name: "Você saiu do experimento" })).toBeVisible();
  await expect(page).toHaveURL(/\/transparencia/);
  const { data } = await db().from("user_cohorts").select("left_at").eq("user_id", b.id).single();
  expect(data?.left_at).not.toBeNull();
});

test("conta antiga entra no experimento como grupo A", async ({ page, context, baseURL }) => {
  await entrar(context, antiga, baseURL!);
  await page.goto("/transparencia");
  await expect(page.getByRole("heading", { name: "Você está no grupo A" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sair do experimento" })).toBeVisible();
});

test("a partir do nível 10 o Início destaca a maestria e o XP fica discreto", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, mestre, baseURL!);
  await page.goto("/inicio");
  await expect(page.getByText("1 tópico concluído")).toBeVisible();
  await expect(page.getByText("1 capítulo concluído")).toBeVisible();
  await expect(page.getByText("Nível 10")).toBeVisible();
});
