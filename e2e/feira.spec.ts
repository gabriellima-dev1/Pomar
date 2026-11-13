/**
 * Aceite da Fase 5 (Feira): o fechamento rodado manualmente promove e rebaixa
 * corretamente. Usa uma semana fictícia (no futuro) com 13 contas de teste, para não
 * mexer na Feira real; o fechamento passa pela mesma rota do cron de segunda.
 */
import { expect, test } from "@playwright/test";
import { apagarContas, criarConta, db, entrar, env, ok, segundaDe, type Conta } from "./apoio";

test.describe.configure({ mode: "serial" });

const SEMANA = segundaDe("2099-12-30");
// XP da semana na ordem das contas; a 4ª é quem abre o app. A última fica em 0 XP.
const XP = [140, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 0];
let contas: Conta[] = [];

test.beforeAll(async () => {
  contas = [];
  for (let i = 0; i < XP.length; i++) {
    contas.push(await criarConta(`f${i}`, { league_division: "prata" }));
  }
  await db().from("league_weeks").delete().eq("week_start", SEMANA);
  ok("semana", await db().from("league_weeks").insert({ week_start: SEMANA }));
  const grupo = ok(
    "grupo",
    await db()
      .from("league_groups")
      .insert({ week_start: SEMANA, division: "prata", band_min: 0, band_max: 3 })
      .select("id")
      .single(),
  );
  ok(
    "membros",
    await db()
      .from("league_members")
      .insert(contas.map((c) => ({ group_id: grupo.id, user_id: c.id, week_start: SEMANA }))),
  );
  // XP dentro da semana (quarta, meio-dia em São Paulo), escrito direto como os testes de banco.
  const quando = new Date(`${SEMANA}T15:00:00Z`);
  quando.setUTCDate(quando.getUTCDate() + 2);
  const eventos = contas.flatMap((c, i) =>
    XP[i]! > 0
      ? [
          {
            user_id: c.id,
            source: "pomodoro",
            amount: XP[i],
            dedupe_key: `e2e:${SEMANA}`,
            created_at: new Date(quando.getTime() + i * 60_000).toISOString(),
          },
        ]
      : [],
  );
  ok("xp", await db().from("xp_events").insert(eventos));
});

test.afterAll(async () => {
  await db().from("league_weeks").delete().eq("week_start", SEMANA);
  await apagarContas(contas);
});

test("a rota do cron recusa quem não tem o segredo", async ({ request }) => {
  expect((await request.get("/api/cron/ligas")).status()).toBe(401);
  const errado = await request.get("/api/cron/ligas?fechar=atual", {
    headers: { authorization: "Bearer errado" },
  });
  expect(errado.status()).toBe(401);
});

test("o fechamento manual promove e rebaixa certo (e repetir não muda nada)", async ({
  request,
}) => {
  const headers = { authorization: `Bearer ${env("CRON_SECRET")}` };
  const res = await request.get(`/api/cron/ligas?fechar=${SEMANA}`, { headers });
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ closed: [SEMANA], opened: null });

  const linhas = ok(
    "resultado",
    await db()
      .from("league_members")
      .select("user_id, final_rank, outcome, xp_week")
      .eq("week_start", SEMANA),
  ) as { user_id: string; final_rank: number | null; outcome: string | null; xp_week: number }[];
  const perfis = ok(
    "divisões",
    await db()
      .from("profiles")
      .select("id, league_division")
      .in(
        "id",
        contas.map((c) => c.id),
      ),
  ) as { id: string; league_division: string }[];
  const por = (i: number) => ({
    ...linhas.find((l) => l.user_id === contas[i]!.id)!,
    divisao: perfis.find((p) => p.id === contas[i]!.id)!.league_division,
  });

  // 12 participantes com XP: 5 sobem para Ouro, 2 ficam, 5 descem para Bronze.
  for (let i = 0; i < 5; i++)
    expect(por(i)).toMatchObject({ final_rank: i + 1, outcome: "up", divisao: "ouro" });
  for (const i of [5, 6])
    expect(por(i)).toMatchObject({ final_rank: i + 1, outcome: "stay", divisao: "prata" });
  for (let i = 7; i < 12; i++)
    expect(por(i)).toMatchObject({ final_rank: i + 1, outcome: "down", divisao: "bronze" });
  // Quem ficou em 0 XP não entrou no ranking: sem posição, sem saída, mesma divisão.
  expect(por(12)).toMatchObject({ final_rank: null, outcome: null, divisao: "prata" });
  expect(por(3).xp_week).toBe(100);

  const denovo = await request.get(`/api/cron/ligas?fechar=${SEMANA}`, { headers });
  expect(await denovo.json()).toEqual({ closed: [], opened: null });
});

test("o resultado da semana aparece uma vez ao abrir o app", async ({ page, context, baseURL }) => {
  const quem = contas[3]!;
  await entrar(context, quem, baseURL!);
  await page.goto("/inicio");
  const dialogo = page.getByRole("dialog", { name: "Feira de Ouro!" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByText("Você subiu")).toBeVisible();
  await expect(dialogo.getByText(/4º lugar na Feira de Prata, com 100 XP/)).toBeVisible();
  await dialogo.getByRole("button", { name: "Fechar" }).click();
  await expect(dialogo).toBeHidden();
  // "Fechar" marca como visto em segundo plano: espera o servidor gravar antes de recarregar.
  await expect
    .poll(async () => {
      const { data } = await db()
        .from("league_members")
        .select("result_seen_at")
        .eq("user_id", quem.id)
        .eq("week_start", SEMANA)
        .single();
      return data?.result_seen_at ?? null;
    })
    .not.toBeNull();
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Feira de Ouro!" })).toHaveCount(0);
});
