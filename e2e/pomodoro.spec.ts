/**
 * Fluxo principal do pomodoro e checagens adiadas para os testes ponta a ponta:
 * - o "fruto de ontem" aparece no primeiro acesso depois de um dia de estudo (#33);
 * - a cena anima (e para com "reduzir movimento") — Fase 3, adiada em 11/11;
 * - no computador a cena ocupa a tela toda (#29);
 * - pausar não pune; o fim do ciclo registra páginas e dá XP no servidor.
 */
import { expect, test } from "@playwright/test";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

let c: Conta;
let disciplina: Awaited<ReturnType<typeof criarDisciplina>>;

function diaMaceio(offset: number): string {
  const d = new Date(Date.now() - 3 * 3600_000 + offset * 86_400_000);
  return d.toISOString().slice(0, 10);
}

async function cicloRodando(minutosAtras: number) {
  await db().from("pomodoro_sessions").delete().eq("user_id", c.id).eq("status", "running");
  return ok(
    "ciclo rodando",
    await db()
      .from("pomodoro_sessions")
      .insert({
        user_id: c.id,
        subject_id: disciplina.subjectId,
        topic_id: disciplina.topicId,
        planned_focus_sec: 1500,
        started_at: new Date(Date.now() - minutosAtras * 60_000).toISOString(),
        status: "running",
      })
      .select("id")
      .single(),
  ).id as string;
}

test.beforeAll(async () => {
  const anteontem = diaMaceio(-2);
  c = await criarConta("pomo", { last_closed_day: anteontem });
  disciplina = await criarDisciplina(c, "Algoritmos E2E");
  // Um ciclo ontem às 19h (Maceió): ao abrir o app, o dia fecha e sai um emblema.
  const ontem = diaMaceio(-1);
  const inicio = new Date(`${ontem}T22:00:00Z`);
  ok(
    "ciclo de ontem",
    await db()
      .from("pomodoro_sessions")
      .insert({
        user_id: c.id,
        subject_id: disciplina.subjectId,
        topic_id: disciplina.topicId,
        planned_focus_sec: 1500,
        started_at: inicio.toISOString(),
        ended_at: new Date(inicio.getTime() + 1500_000).toISOString(),
        status: "completed",
        pages_logged: 6,
      }),
  );
});

test.afterAll(async () => {
  await apagarContas([c]);
});

test("o fruto de ontem aparece já no primeiro acesso", async ({ page, context, baseURL }) => {
  await entrar(context, c, baseURL!);
  await page.goto("/inicio");
  const dialogo = page.getByRole("dialog");
  await expect(dialogo.getByText(/seu fruto de ontem/i)).toBeVisible();
  await expect(dialogo.getByRole("button", { name: "Colher" })).toBeVisible();
  const { count } = await db()
    .from("user_daily_badges")
    .select("day", { count: "exact", head: true })
    .eq("user_id", c.id);
  expect(count).toBe(1);
});

test("a cena do pomodoro anima e para com reduzir movimento", async ({ browser, baseURL }) => {
  const animada = await browser.newContext();
  await entrar(animada, c, baseURL!);
  const p1 = await animada.newPage();
  await p1.goto(`/pomodoro?disciplina=${disciplina.subjectId}`);
  await expect(p1.getByRole("button", { name: "Começar foco" })).toBeVisible();
  const rodando = await p1.evaluate(
    () => document.getAnimations().filter((a) => a.playState === "running").length,
  );
  expect(rodando).toBeGreaterThanOrEqual(10);
  await animada.close();

  const parada = await browser.newContext({ reducedMotion: "reduce" });
  await entrar(parada, c, baseURL!);
  const p2 = await parada.newPage();
  await p2.goto(`/pomodoro?disciplina=${disciplina.subjectId}`);
  await expect(p2.getByRole("button", { name: "Começar foco" })).toBeVisible();
  expect(
    await p2.evaluate(
      () => document.getAnimations().filter((a) => a.playState === "running").length,
    ),
  ).toBe(0);
  await parada.close();
});

test("no computador a cena ocupa a largura toda", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await entrar(ctx, c, baseURL!);
  const page = await ctx.newPage();
  await page.goto(`/pomodoro?disciplina=${disciplina.subjectId}`);
  await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const svg = document.querySelector('svg[preserveAspectRatio="xMidYMax meet"]');
        return Number(svg?.getAttribute("viewBox")?.split(" ")[2] ?? 0);
      }),
    )
    .toBeGreaterThan(1300);
  await ctx.close();
});

test("pausar abre o convite e não pune", async ({ page, context, baseURL }) => {
  const id = await cicloRodando(5);
  await entrar(context, c, baseURL!);
  await page.goto("/pomodoro");
  await page.getByRole("button", { name: "Pausar" }).click();
  const dialogo = page.getByRole("dialog", { name: "Pausas quebram o foco" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("button", { name: "Reiniciar ciclo" })).toBeVisible();
  await dialogo.getByRole("button", { name: "Continuar mesmo assim" }).click();
  await expect(dialogo).toBeHidden();

  const s = ok(
    "ciclo",
    await db().from("pomodoro_sessions").select("status, pauses, xp_awarded").eq("id", id).single(),
  ) as { status: string; pauses: number; xp_awarded: number };
  expect(s.pauses).toBe(1);
  expect(s.status).not.toBe("cancelled");
  await db().from("pomodoro_sessions").delete().eq("id", id);
});

test("o fim do ciclo registra as páginas e dá XP no servidor", async ({
  page,
  context,
  baseURL,
}) => {
  const id = await cicloRodando(25.7);
  await entrar(context, c, baseURL!);
  await page.goto("/pomodoro");
  const dialogo = page.getByRole("dialog", { name: "Fruto colhido!" });
  await expect(dialogo).toBeVisible({ timeout: 20_000 });
  await expect(dialogo.getByText("Páginas lidas")).toBeVisible();
  await dialogo.getByRole("button", { name: /Começar descanso de \d+ min/ }).click();
  await expect(page.getByText("Descanso", { exact: true })).toBeVisible();

  await expect
    .poll(async () => {
      const { data } = await db()
        .from("pomodoro_sessions")
        .select("status, pages_logged, xp_awarded")
        .eq("id", id)
        .single();
      return data;
    })
    .toMatchObject({ status: "completed" });
  const s = ok(
    "ciclo",
    await db().from("pomodoro_sessions").select("pages_logged, xp_awarded").eq("id", id).single(),
  ) as { pages_logged: number | null; xp_awarded: number };
  expect(s.pages_logged).toBeGreaterThan(0);
  expect(s.xp_awarded).toBeGreaterThan(0);
});
