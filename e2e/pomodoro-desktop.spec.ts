/**
 * Pomodoro no computador (telas.md › Pomodoro no computador; referencias/35-*):
 * - em 1440×900, cada tema tem a cena larga (viewBox 1350×844, slice), o painel de
 *   440px à esquerda, até 5 camadas animadas e nenhuma animação com "reduzir movimento"
 *   (captura de cada tema em .e2e-resultados/);
 * - atalhos: Espaço pausa (passando pelo nudge) e retoma; F entra e sai da tela cheia;
 *   nada acontece com o foco num campo ou com um diálogo aberto;
 * - abaixo de 1024px nada muda (folha de controles do celular).
 */
import {
  expect,
  test,
  type Browser,
  type BrowserContextOptions,
  type Page,
} from "@playwright/test";
import { apagarContas, criarConta, criarDisciplina, db, entrar, ok, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

const TEMAS = ["classico", "noturno", "halloween", "natal"] as const;
const DESKTOP = { width: 1440, height: 900 };

let c: Conta;
let disciplina: Awaited<ReturnType<typeof criarDisciplina>>;

async function tema(t: (typeof TEMAS)[number]) {
  ok("tema", await db().from("profiles").update({ theme: t }).eq("id", c.id));
}

async function semCiclo() {
  await db().from("pomodoro_sessions").delete().eq("user_id", c.id).eq("status", "running");
}

/** Ciclo de 25 min começado há `minutos` (pausado, se pedido). */
async function cicloRodando(minutos: number, { pausado = false } = {}) {
  await semCiclo();
  return ok(
    "ciclo rodando",
    await db()
      .from("pomodoro_sessions")
      .insert({
        user_id: c.id,
        subject_id: disciplina.subjectId,
        topic_id: disciplina.topicId,
        planned_focus_sec: 1500,
        started_at: new Date(Date.now() - minutos * 60_000).toISOString(),
        paused_at: pausado ? new Date(Date.now() - 30_000).toISOString() : null,
        pauses: pausado ? 1 : 0,
        status: "running",
      })
      .select("id")
      .single(),
  ).id as string;
}

async function abrir(browser: Browser, opts: BrowserContextOptions = {}) {
  const ctx = await browser.newContext({ viewport: DESKTOP, ...opts });
  await entrar(ctx, c, test.info().project.use.baseURL ?? "http://localhost:3100");
  const page = await ctx.newPage();
  await page.goto(`/pomodoro?disciplina=${disciplina.subjectId}`);
  return { ctx, page };
}

/** Animações CSS rodando dentro da cena larga, agrupadas pela camada (`data-camada`). */
function animacoesDaCena(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector("svg[data-cena-larga]");
    const rodando = document.getAnimations().filter((a) => {
      const alvo = (a.effect as KeyframeEffect | null)?.target;
      return a.playState === "running" && alvo instanceof Element && svg?.contains(alvo);
    });
    const porCamada: Record<string, number> = {};
    for (const a of rodando) {
      const alvo = (a.effect as KeyframeEffect).target as Element;
      const camada = alvo.closest("[data-camada]")?.getAttribute("data-camada") ?? "sem-camada";
      porCamada[camada] = (porCamada[camada] ?? 0) + 1;
    }
    return { total: rodando.length, porCamada };
  });
}

test.beforeAll(async () => {
  c = await criarConta("desk");
  disciplina = await criarDisciplina(c, "Algoritmos E2E");
  ok(
    "temas",
    await db()
      .from("user_themes")
      .upsert(
        ["halloween", "natal"].map((theme_code) => ({ user_id: c.id, theme_code })),
        { onConflict: "user_id,theme_code" },
      ),
  );
});

test.afterAll(async () => {
  await apagarContas([c]);
});

for (const t of TEMAS) {
  test(`1440×900 · ${t}: cena larga, painel à esquerda e animações leves`, async ({ browser }) => {
    await tema(t);
    await cicloRodando(6);

    const { ctx, page } = await abrir(browser);
    const cena = page.locator(`svg[data-cena-larga="${t}"]`);
    await expect(cena).toBeAttached();
    await expect(cena).toHaveAttribute("viewBox", "0 0 1350 844");
    await expect(cena).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    expect(await cena.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1440, height: 900 });

    const painel = page.getByRole("region", { name: "Pomodoro" });
    await expect(painel.getByRole("button", { name: "Pausar" })).toBeVisible();
    await expect(painel.getByRole("timer")).toBeVisible();
    await expect(page.getByText("Espaço pausa · F tela cheia")).toBeVisible();
    const caixa = (await painel.boundingBox())!;
    expect(caixa.width).toBe(440);
    expect(caixa.x).toBe(120);

    await page.waitForTimeout(600); // fontes e o primeiro quadro das animações
    await page.screenshot({ path: test.info().outputPath(`pomodoro-desktop-${t}.png`) });

    const { total, porCamada } = await animacoesDaCena(page);
    expect(total).toBeGreaterThan(0);
    expect(Object.keys(porCamada).length, JSON.stringify(porCamada)).toBeLessThanOrEqual(5);
    expect(porCamada["sem-camada"], "toda animação pertence a uma camada").toBeUndefined();
    for (const particulas of ["estrelas", "vagalumes", "neve"]) {
      expect(porCamada[particulas] ?? 0, particulas).toBeLessThanOrEqual(20);
    }
    await ctx.close();

    const parado = await abrir(browser, { reducedMotion: "reduce" });
    await expect(parado.page.locator(`svg[data-cena-larga="${t}"]`)).toBeAttached();
    await expect(parado.page.getByRole("button", { name: "Pausar" })).toBeVisible();
    expect((await animacoesDaCena(parado.page)).total).toBe(0);
    await parado.ctx.close();
  });
}

test("Espaço pausa pelo convite do nudge e o botão continua igual", async ({ browser }) => {
  await tema("classico");
  const id = await cicloRodando(4);
  const { ctx, page } = await abrir(browser);
  await expect(page.getByRole("button", { name: "Pausar" })).toHaveAttribute(
    "aria-keyshortcuts",
    "Space",
  );

  await page.keyboard.press("Space");
  const nudge = page.getByRole("dialog", { name: "Pausas quebram o foco" });
  await expect(nudge).toBeVisible();
  await expect
    .poll(async () => {
      const { data } = await db().from("pomodoro_sessions").select("pauses").eq("id", id).single();
      return data?.pauses;
    })
    .toBe(1);

  // Com o diálogo aberto, F não faz nada.
  await nudge.getByRole("heading").click();
  await page.keyboard.press("f");
  expect(await page.evaluate(() => document.fullscreenElement === null)).toBe(true);

  await nudge.getByRole("button", { name: "Continuar mesmo assim" }).click();
  await expect(nudge).toBeHidden();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();

  // Foco num campo de texto: Espaço é do campo.
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.id = "campo-teste";
    document.body.appendChild(input);
    input.focus();
  });
  await page.keyboard.press("Space");
  await expect(nudge).toBeHidden();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  await ctx.close();
  await semCiclo();
});

test("Espaço retoma um ciclo pausado", async ({ browser }) => {
  const id = await cicloRodando(8, { pausado: true });
  const { ctx, page } = await abrir(browser);
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  await expect
    .poll(async () => {
      const { data } = await db()
        .from("pomodoro_sessions")
        .select("paused_at")
        .eq("id", id)
        .single();
      return data?.paused_at ?? null;
    })
    .toBeNull();
  await ctx.close();
  await semCiclo();
});

test("F entra e sai da tela cheia", async ({ browser }) => {
  await semCiclo();
  const { ctx, page } = await abrir(browser);
  const botao = page.getByRole("button", { name: "Tela cheia" });
  await expect(botao).toHaveAttribute("aria-keyshortcuts", "F");

  await page.keyboard.press("f");
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
  await expect(page.getByRole("button", { name: "Sair da tela cheia" })).toBeVisible();

  await page.keyboard.press("f");
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(false);
  await expect(page.getByRole("button", { name: "Tela cheia" })).toBeVisible();
  await ctx.close();
});

test("abaixo de 1024px nada muda", async ({ browser }) => {
  await semCiclo();
  const { ctx, page } = await abrir(browser, { viewport: { width: 390, height: 844 } });
  await expect(page.getByRole("button", { name: "Começar foco" })).toBeVisible();
  await expect(page.locator("svg[data-cena-larga]")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Pomodoro" })).toHaveCount(0);
  await expect(page.getByText("Espaço pausa · F tela cheia")).toHaveCount(0);
  await page.keyboard.press("f");
  expect(await page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await ctx.close();
});
