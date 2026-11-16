/**
 * Acessibilidade básica (PLANO Fase 6; CLAUDE.md › Interface: contraste AA, foco de
 * teclado visível): axe (WCAG 2.1 A/AA) nas telas principais, no celular (390px) e no
 * computador (1440px), nos temas Clássico e Noturno. Também confere o anel de foco.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

let c: Conta;
let disciplina: Awaited<ReturnType<typeof criarDisciplina>>;

const LOGADO = (id: string) => [
  "/inicio",
  "/disciplinas",
  `/disciplinas/${id}`,
  `/pomodoro?disciplina=${id}`,
  "/conquistas",
  "/conquistas?aba=temas",
  "/liga",
  "/estatisticas",
  "/configuracoes",
  "/transparencia",
];
const PUBLICO = ["/", "/login", "/cadastro", "/transparencia", "/privacidade"];
const TELAS = [
  { nome: "celular", viewport: { width: 390, height: 844 } },
  { nome: "computador", viewport: { width: 1440, height: 900 } },
];

type Falha = { tela: string; regra: string; impacto: string | null; alvos: string[] };

async function auditar(page: Page, rotulo: string): Promise<Falha[]> {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return r.violations.map((v) => ({
    tela: rotulo,
    regra: `${v.id}: ${v.help}`,
    impacto: v.impact ?? null,
    alvos: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
  }));
}

async function rodar(browser: Browser, rotas: string[], logado: boolean, tema: string) {
  const falhas: Falha[] = [];
  for (const t of TELAS) {
    const ctx = await browser.newContext({ viewport: t.viewport, reducedMotion: "reduce" });
    if (logado) await entrar(ctx, c, test.info().project.use.baseURL ?? "http://localhost:3100");
    const page = await ctx.newPage();
    for (const rota of rotas) {
      await page.goto(rota);
      await page.waitForLoadState("networkidle");
      falhas.push(...(await auditar(page, `${tema} · ${t.nome} · ${rota}`)));
    }
    await ctx.close();
  }
  return falhas;
}

function relatorio(falhas: Falha[]): string {
  return falhas
    .map((f) => `- [${f.impacto}] ${f.tela}\n    ${f.regra}\n    ${f.alvos.join("\n    ")}`)
    .join("\n");
}

test.beforeAll(async () => {
  c = await criarConta("a11y", { level_seen: 1 });
  disciplina = await criarDisciplina(c, "Acessibilidade E2E", { comCiclo: true });
});

test.afterAll(async () => {
  await apagarContas([c]);
});

test("páginas públicas sem violações do axe (WCAG 2.1 AA)", async ({ browser }) => {
  const falhas = await rodar(browser, PUBLICO, false, "público");
  expect(falhas, relatorio(falhas)).toEqual([]);
});

for (const tema of ["classico", "noturno"] as const) {
  test(`telas logadas sem violações do axe · ${tema}`, async ({ browser }) => {
    ok("tema", await db().from("profiles").update({ theme: tema }).eq("id", c.id));
    const falhas = await rodar(browser, LOGADO(disciplina.subjectId), true, tema);
    expect(falhas, relatorio(falhas)).toEqual([]);
  });
}

test("diálogos sem violações do axe (nudge da pausa e excluir conta)", async ({ browser }) => {
  ok("tema", await db().from("profiles").update({ theme: "classico" }).eq("id", c.id));
  const falhas: Falha[] = [];
  for (const t of TELAS) {
    await db().from("pomodoro_sessions").delete().eq("user_id", c.id).eq("status", "running");
    ok(
      "ciclo rodando",
      await db()
        .from("pomodoro_sessions")
        .insert({
          user_id: c.id,
          subject_id: disciplina.subjectId,
          topic_id: disciplina.topicId,
          planned_focus_sec: 1500,
          started_at: new Date(Date.now() - 3 * 60_000).toISOString(),
          status: "running",
        }),
    );
    const ctx = await browser.newContext({ viewport: t.viewport, reducedMotion: "reduce" });
    await entrar(ctx, c, test.info().project.use.baseURL ?? "http://localhost:3100");
    const page = await ctx.newPage();
    await page.goto("/pomodoro");
    await page.getByRole("button", { name: "Pausar" }).click();
    await expect(page.getByRole("dialog", { name: "Pausas quebram o foco" })).toBeVisible();
    falhas.push(...(await auditar(page, `${t.nome} · nudge da pausa`)));
    await page.goto("/configuracoes");
    await page.getByRole("button", { name: "Excluir conta" }).click();
    await expect(page.getByRole("dialog", { name: "Excluir sua conta?" })).toBeVisible();
    falhas.push(...(await auditar(page, `${t.nome} · excluir conta`)));
    await ctx.close();
  }
  await db().from("pomodoro_sessions").delete().eq("user_id", c.id).eq("status", "running");
  expect(falhas, relatorio(falhas)).toEqual([]);
});

test("o foco do teclado aparece (anel de 3px)", async ({ page, context, baseURL }) => {
  await entrar(context, c, baseURL!);
  await page.goto("/inicio");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    return { width: s.outlineWidth, style: s.outlineStyle };
  });
  expect(outline).toEqual({ width: "3px", style: "solid" });
});
