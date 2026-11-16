/**
 * Fluxo do onboarding (telas.md › Fluxo do onboarding, DESIGN §9.2): cadastro pelo
 * formulário → boas-vindas → quiz (8 perguntas) → perfil → Feira (nada marcado) → 1ª
 * disciplina do catálogo → calibração → 1º pomodoro → fim do ciclo → primeiro fruto →
 * Início. A confirmação de e-mail está desligada (DECISOES 07/11), então o cadastro já
 * entra. O tempo do 1º foco é adiantado no banco, como nos outros testes do pomodoro.
 */
import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { apagarContas, db, eventos, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

let c: Conta | undefined;

test.afterAll(async () => {
  await apagarContas([c]);
});

test("cadastro pelo formulário chega sozinho ao primeiro fruto e ao Início", async ({ page }) => {
  test.setTimeout(150_000);
  const email = `e2e.${Date.now().toString(36)}.onb@example.com`;
  const password = randomUUID();

  // Cadastro pelo formulário (tela de cadastro → Início → onboarding).
  await page.goto("/cadastro");
  await page.getByLabel("Como podemos te chamar?").fill("Onboarding E2E");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: 20_000 });

  const { data: lista } = await db().auth.admin.listUsers({ page: 1, perPage: 200 });
  const user = lista.users.find((u) => u.email === email);
  expect(user, "conta criada pelo cadastro").toBeDefined();
  c = { id: user!.id, email, password, apelido: "" };
  // Conta de teste: fica fora das métricas (o selo de demo não aparece no onboarding).
  ok("demo", await db().from("profiles").update({ is_demo: true }).eq("id", c.id));
  expect(await eventos(c, "signup_completed")).toBe(1);

  // Até terminar, o Início leva ao passo atual.
  await page.goto("/inicio");
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("button", { name: "Vamos lá" }).click();

  // Quiz de Bartle: 8 perguntas, "Próxima" só com uma escolha.
  await expect(page).toHaveURL(/\/onboarding\/quiz/);
  for (let i = 1; i <= 8; i++) {
    const proxima = page.getByRole("button", { name: i === 8 ? "Ver meu perfil" : "Próxima" });
    await expect(proxima).toBeDisabled();
    await page.getByRole("radio").first().check();
    await proxima.click();
    if (i < 8) await expect(page.getByText(`${i + 1} de 8`)).toBeVisible();
  }

  await expect(page).toHaveURL(/\/onboarding\/perfil/);
  await page.getByRole("button", { name: /^Continuar como / }).click();

  // Feira: nenhuma opção marcada.
  await expect(page).toHaveURL(/\/onboarding\/feira/);
  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(2);
  for (const r of await radios.all()) await expect(r).not.toBeChecked();
  await page.getByText("Agora não, prefiro estudar no meu canto").click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // 1ª disciplina pelo catálogo, com a calibração informada direto.
  await expect(page).toHaveURL(/\/disciplinas\/nova/);
  await page.locator('a[href^="/disciplinas/nova?livro="]').first().click();
  await expect(page).toHaveURL(/livro=/);
  await page
    .locator('section[aria-labelledby="livro-escolhido"]')
    .getByRole("checkbox")
    .first()
    .check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Passo 4 de 5")).toBeVisible();
  await page.getByRole("button", { name: "Prefiro informar direto" }).click();
  await page.getByLabel("Quantos minutos você leva por página?").fill("2,5");
  await page.getByRole("button", { name: "Salvar e criar disciplina" }).click();

  // 1º pomodoro.
  await expect(page).toHaveURL(/\/pomodoro\?disciplina=/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Começar foco" }).click();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  const { data: sessao } = await db()
    .from("pomodoro_sessions")
    .select("id, planned_focus_sec")
    .eq("user_id", c.id)
    .eq("status", "running")
    .single();
  expect(sessao).not.toBeNull();
  // Adianta o foco: começou há (foco + 30 s).
  ok(
    "adiantar foco",
    await db()
      .from("pomodoro_sessions")
      .update({
        started_at: new Date(Date.now() - (sessao!.planned_focus_sec + 30) * 1000).toISOString(),
      })
      .eq("id", sessao!.id),
  );
  await page.evaluate(() => window.localStorage.removeItem("pomar:timer"));
  await page.reload();

  // Fim do ciclo → primeiro fruto → Início.
  const fim = page.getByRole("dialog", { name: "Fruto colhido!" });
  await expect(fim).toBeVisible({ timeout: 20_000 });
  await fim.getByRole("button", { name: /Começar descanso de \d+ min/ }).click();
  // A sugestão de recalibrar aparece quando as páginas divergem do ritmo informado.
  const ritmo = page.getByRole("button", { name: "Manter como está" });
  await expect(ritmo.or(page.getByText("Primeiro fruto colhido!"))).toBeVisible({
    timeout: 20_000,
  });
  if (await ritmo.isVisible()) await ritmo.click();
  await expect(page).toHaveURL(/\/onboarding\/primeiro-fruto/, { timeout: 20_000 });
  await expect(page.getByText("Primeiro fruto colhido!")).toBeVisible();
  await page.getByRole("button", { name: "Ir para o meu pomar" }).click();
  await expect(page).toHaveURL(/\/inicio/);

  // O funil inteiro ficou registrado (DESIGN §9.2).
  for (const evento of [
    "onboarding_quiz_completed",
    "league_opt_in_choice",
    "subject_created",
    "calibration_completed",
    "pomodoro_started",
    "pomodoro_completed",
  ]) {
    expect(await eventos(c, evento), evento).toBeGreaterThan(0);
  }
  const { data: perfil } = await db()
    .from("profiles")
    .select("onboarding_step, league_opt_in")
    .eq("id", c.id)
    .single();
  expect(perfil).toEqual({ onboarding_step: "concluido", league_opt_in: false });
});
