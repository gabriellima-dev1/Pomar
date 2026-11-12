/**
 * Aceite da Fase 5 (social): dois usuários de teste se seguem e veem as conquistas um
 * do outro. Também: apelido (tela 24), parabéns sem repetir, perfil público sem login
 * e perfil privado.
 */
import { expect, test } from "@playwright/test";
import {
  apagarContas,
  criarConta,
  criarDisciplina,
  db,
  entrar,
  eventos,
  ok,
  type Conta,
} from "./apoio";

test.describe.configure({ mode: "serial" });

let a: Conta;
let b: Conta;
let disciplina: Awaited<ReturnType<typeof criarDisciplina>>;
const TITULO = "Redes E2E";

test.beforeAll(async () => {
  // A ainda não escolheu apelido e começa com o perfil fechado.
  a = await criarConta("a", { username: null, public_profile: false });
  b = await criarConta("b");
  disciplina = await criarDisciplina(a, TITULO, { comCiclo: true });
});

test.afterAll(async () => {
  await apagarContas([a, b]);
});

test("A escolhe o apelido na primeira visita a Amigos e deixa o perfil público", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, a, baseURL!);
  await page.goto("/liga?aba=amigos");
  await expect(page).toHaveURL(/\/liga\/apelido/);
  await expect(page.getByRole("heading", { name: "Escolha seu apelido" })).toBeVisible();

  const publico = page.getByRole("checkbox", { name: /Deixar meu perfil público/ });
  await expect(publico).not.toBeChecked();

  // Apelido de outra pessoa: "Já em uso".
  await page.getByRole("textbox", { name: "Apelido" }).fill(b.apelido);
  await expect(page.getByText("Já em uso")).toBeVisible();

  await page.getByRole("textbox", { name: "Apelido" }).fill(a.apelido);
  await expect(page.getByText("Disponível")).toBeVisible();
  await publico.check();
  await page.getByRole("button", { name: "Salvar apelido" }).click();
  await expect(page).toHaveURL(/\/liga\?aba=amigos/);

  const p = ok(
    "perfil",
    await db().from("profiles").select("username, public_profile").eq("id", a.id).single(),
  );
  expect(p).toEqual({ username: a.apelido, public_profile: true });
});

test("A e B se seguem pela busca", async ({ browser, baseURL }) => {
  for (const [quem, alvo] of [
    [a, b],
    [b, a],
  ] as const) {
    const context = await browser.newContext();
    await entrar(context, quem, baseURL!);
    const page = await context.newPage();
    await page.goto("/liga/buscar");
    await page.getByPlaceholder("Buscar pessoas pelo apelido").fill(alvo.apelido.slice(0, 8));
    await page.getByRole("button", { name: `Seguir @${alvo.apelido}` }).click();
    await expect(
      page.getByRole("button", { name: new RegExp(`Seguindo @${alvo.apelido}`) }),
    ).toBeVisible();
    // "Seguindo" aparece antes da resposta do servidor: espera gravar antes de sair.
    await expect
      .poll(async () => {
        const { count } = await db()
          .from("follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("follower_id", quem.id)
          .eq("followee_id", alvo.id);
        return count;
      })
      .toBe(1);
    await context.close();
  }
  const { count } = await db()
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .in("follower_id", [a.id, b.id]);
  expect(count).toBe(2);
  expect(await eventos(a, "follow_created")).toBe(1);
  expect(await eventos(b, "follow_created")).toBe(1);
});

test("A conclui o capítulo e B vê a conquista no feed", async ({ browser, baseURL }) => {
  const ctxA = await browser.newContext();
  await entrar(ctxA, a, baseURL!);
  const pageA = await ctxA.newPage();
  await pageA.goto(`/disciplinas/${disciplina.subjectId}`);
  await pageA.getByRole("checkbox", { name: new RegExp(disciplina.topicTitle) }).check();
  await expect(pageA.getByText("Concluído")).toBeVisible();
  await ctxA.close();

  const ctxB = await browser.newContext();
  await entrar(ctxB, b, baseURL!);
  const pageB = await ctxB.newPage();
  await pageB.goto("/liga?aba=amigos");
  await expect(pageB.getByText(`terminou o capítulo 1 de ${TITULO}`)).toBeVisible();
  await expect(pageB.getByText(`concluiu a disciplina ${TITULO}`)).toBeVisible();
  await ctxB.close();
});

test("B dá parabéns (uma vez só) e A vê a faixa", async ({ browser, baseURL }) => {
  const ctxB = await browser.newContext();
  await entrar(ctxB, b, baseURL!);
  const pageB = await ctxB.newPage();
  await pageB.goto("/liga?aba=amigos");
  await pageB
    .getByRole("button", { name: `Dar parabéns para @${a.apelido}` })
    .first()
    .click();
  await expect(pageB.getByText("Enviado").first()).toBeVisible();
  // "Enviado" também é otimista: espera o servidor gravar antes de recarregar.
  await expect
    .poll(async () => {
      const { count } = await db()
        .from("reactions")
        .select("event_id", { count: "exact", head: true })
        .eq("user_id", b.id);
      return count;
    })
    .toBe(1);
  await pageB.reload();
  // Depois de recarregar, o parabéns continua enviado e não dá para repetir.
  await expect(pageB.getByText("Enviado").first()).toBeVisible();
  await ctxB.close();

  const { count } = await db()
    .from("reactions")
    .select("event_id", { count: "exact", head: true })
    .eq("user_id", b.id);
  expect(count).toBe(1);
  expect(await eventos(b, "reaction_sent")).toBe(1);

  const ctxA = await browser.newContext();
  await entrar(ctxA, a, baseURL!);
  const pageA = await ctxA.newPage();
  await pageA.goto("/liga?aba=amigos");
  await expect(pageA.getByText(/deu parabéns pel/)).toBeVisible();
  await expect(pageA.getByText(b.apelido).first()).toBeVisible();
  await ctxA.close();
});

test("perfil público abre sem login; privado não mostra nada", async ({ page }) => {
  await page.goto(`/perfil/${a.apelido}`);
  await expect(page.getByRole("heading", { name: `@${a.apelido}` })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar para seguir" })).toBeVisible();
  await expect(page.getByText(`Terminou o capítulo 1 de ${TITULO}`)).toBeVisible();

  ok("fechar perfil", await db().from("profiles").update({ public_profile: false }).eq("id", a.id));
  await page.reload();
  await expect(page.getByText("Este perfil é privado")).toBeVisible();
  await expect(page.getByText(TITULO)).toHaveCount(0);
});
