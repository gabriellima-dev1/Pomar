/**
 * Configurações da Fase 6 (telas 31 e 32, DESIGN §10):
 * - perfil público desligado por padrão e interruptor gravando no banco;
 * - nome editável; exportar meus dados (JSON com o que é da pessoa);
 * - sair do experimento (coorte B passa a ver as recompensas, card some);
 * - excluir conta: só libera com o apelido digitado, apaga em cascata, anonimiza a
 *   telemetria e volta à landing com o aviso.
 */
import { expect, test } from "@playwright/test";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

let c: Conta;
let excluir: Conta;

test.beforeAll(async () => {
  c = await criarConta("conf", { public_profile: false });
  await criarDisciplina(c, "Cálculo E2E", { comCiclo: true });
  ok("coorte B", await db().from("user_cohorts").update({ cohort: "B" }).eq("user_id", c.id));
  excluir = await criarConta("tchau");
  await criarDisciplina(excluir, "Some E2E", { comCiclo: true });
  ok(
    "evento",
    await db()
      .from("telemetry_events")
      .insert({ user_id: excluir.id, anon_id: `e2e-${excluir.id}`, name: "app_opened", props: {} }),
  );
});

test.afterAll(async () => {
  await apagarContas([c, excluir]);
});

test("as quatro seções aparecem, sem nada escondido", async ({ page, context, baseURL }) => {
  await entrar(context, c, baseURL!);
  await page.goto("/configuracoes");
  for (const secao of ["Conta", "Estudo", "Jogo", "Privacidade e dados"]) {
    await expect(page.getByRole("heading", { name: secao, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Foco 25 · descanso 5 · longo 15 min")).toBeVisible();
  await expect(page.getByRole("button", { name: "Excluir conta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sair da conta" })).toBeVisible();
});

test("perfil público começa desligado e o interruptor grava", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, c, baseURL!);
  await page.goto("/configuracoes");
  const caixa = page.getByRole("checkbox", { name: /Perfil público/ });
  await expect(caixa).not.toBeChecked();
  await caixa.check();
  await expect
    .poll(async () => {
      const { data } = await db().from("profiles").select("public_profile").eq("id", c.id).single();
      return data?.public_profile;
    })
    .toBe(true);
  await caixa.uncheck();
  await expect
    .poll(async () => {
      const { data } = await db().from("profiles").select("public_profile").eq("id", c.id).single();
      return data?.public_profile;
    })
    .toBe(false);
});

test("muda o nome", async ({ page, context, baseURL }) => {
  await entrar(context, c, baseURL!);
  await page.goto("/configuracoes");
  await page.getByRole("button", { name: /^Nome/ }).click();
  const dialogo = page.getByRole("dialog", { name: "Seu nome" });
  await dialogo.getByLabel("Nome").fill("  Carla   Teste ");
  await dialogo.getByRole("button", { name: "Salvar nome" }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByRole("button", { name: /Nome.*Carla Teste/ })).toBeVisible();
});

test("exportar meus dados baixa um JSON com o que é da pessoa", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, c, baseURL!);
  await page.goto("/configuracoes");
  const res = await page.request.get("/api/export");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-disposition"]).toMatch(/attachment; filename="pomar-meus-dados-/);
  const body = await res.json();
  expect(body.conta.id).toBe(c.id);
  expect(body.perfil.id).toBe(c.id);
  expect(body.disciplinas).toHaveLength(1);
  expect(body.pomodoros.length).toBeGreaterThan(0);
  expect(Array.isArray(body.eventos_de_uso)).toBe(true);

  const anon = await page.context().browser()!.newContext();
  const semLogin = await anon.request.get(`${baseURL}/api/export`, { maxRedirects: 0 });
  expect([401, 302, 307]).toContain(semLogin.status());
  await anon.close();
});

test("sair do experimento: o grupo B passa a ver as recompensas", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, c, baseURL!);
  await page.goto("/configuracoes");
  await expect(page.getByText("Você está no grupo que não vê as recompensas.")).toBeVisible();
  await page.getByRole("button", { name: "Sair do experimento" }).click();
  const dialogo = page.getByRole("dialog", { name: "Sair do experimento?" });
  await dialogo.getByRole("button", { name: "Sair do experimento" }).click();
  await expect(
    page.getByText("Você saiu do experimento e agora vê todas as recompensas."),
  ).toBeVisible();
  await expect(page.getByText("Experimento da disciplina")).toHaveCount(0);
  const { data } = await db()
    .from("user_cohorts")
    .select("cohort, left_at")
    .eq("user_id", c.id)
    .single();
  expect(data?.cohort).toBe("B");
  expect(data?.left_at).not.toBeNull();
});

test("excluir conta só com o apelido; apaga tudo e anonimiza a telemetria", async ({
  page,
  context,
  baseURL,
}) => {
  await entrar(context, excluir, baseURL!);
  await page.goto("/configuracoes");
  await page.getByRole("button", { name: "Excluir conta" }).click();
  const dialogo = page.getByRole("dialog", { name: "Excluir sua conta?" });
  await expect(dialogo.getByText(excluir.apelido, { exact: true })).toBeVisible();
  const botao = dialogo.getByRole("button", { name: "Excluir para sempre" });
  await expect(botao).toBeDisabled();
  const campo = dialogo.getByRole("textbox");
  await campo.fill(excluir.apelido.slice(0, -1));
  await expect(botao).toBeDisabled();
  await campo.fill(excluir.apelido);
  await expect(botao).toBeEnabled();
  await botao.click();

  await expect(page).toHaveURL(/\/(\?conta=excluida)?$/);
  await expect(page.getByText("Sua conta foi excluída")).toBeVisible();

  const { data: user } = await db().auth.admin.getUserById(excluir.id);
  expect(user.user).toBeNull();
  const { count: subjects } = await db()
    .from("subjects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", excluir.id);
  expect(subjects).toBe(0);
  const { data: evento } = await db()
    .from("telemetry_events")
    .select("user_id")
    .eq("anon_id", `e2e-${excluir.id}`)
    .single();
  expect(evento?.user_id).toBeNull();
  await db().from("telemetry_events").delete().eq("anon_id", `e2e-${excluir.id}`);
});
