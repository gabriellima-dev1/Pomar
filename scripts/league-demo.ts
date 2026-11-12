/**
 * Prepara um grupo da Feira com CONTAS DE TESTE para o aceite da Fase 5.
 * Uso: npm run demo:league -- <email> [--divisao prata] --confirmo
 *      npm run demo:league -- --remover --confirmo      (apaga as contas teste.liga.*)
 *      (lê .env.local; precisa de SUPABASE_SECRET_KEY)
 *
 * Passo a passo do aceite:
 *   1. npm run league:close -- --confirmo                         (abre a semana atual)
 *   2. npm run demo:league -- teste@exemplo.com --confirmo        (este script)
 *   3. abrir a Liga com a conta de teste: grupo de 13, zonas e selo "demo"
 *   4. npm run league:close -- --fechar-semana-atual --confirmo   (fecha agora)
 *   5. abrir o app: tela "Resultado da semana" uma vez; divisões trocadas
 *
 * Cria (ou reaproveita) 12 contas `teste.liga.NN@example.com` (is_demo, fora da Feira
 * real, algumas com perfil público), põe todas num grupo novo da semana atual junto com a
 * conta de teste e dá a cada uma ciclos concluídos nesta semana, com o XP aplicado
 * pela mesma função do servidor (apply_xp). Nunca use numa conta real: a conta entra
 * na Feira, sai do grupo em que estava e muda de divisão.
 */
import { createClient } from "@supabase/supabase-js";
import { localDay, weekStart, zonedMidnight } from "../lib/dates.ts";
import { levelForXp } from "../lib/gamification/levels.ts";

const DEMOS = [
  ["ana.r", 14, true],
  ["tiago_s", 11, false],
  ["lucas.m", 9, true],
  ["bia_estuda", 8, true],
  ["mari.c", 6, true],
  ["jp_dev", 5, false],
  ["luiza_f", 4, true],
  ["lu.costa", 3, false],
  ["caio.p", 2, true],
  ["duda_s", 2, false],
  ["rafa.t", 1, true],
  ["nina.b", 0, false],
] as const;

const DIVISIONS = ["bronze", "prata", "ouro", "esmeralda"];

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável ausente: ${name}. Configure em .env.local.`);
    process.exit(1);
  }
  return value;
}

const args = process.argv.slice(2);
const remove = args.includes("--remover");
const email = args.find((a) => a.includes("@"));
const divIndex = args.indexOf("--divisao");
const division = divIndex >= 0 ? (args[divIndex + 1] ?? "") : "prata";
if ((!remove && !email) || !DIVISIONS.includes(division)) {
  console.error(
    "Uso: npm run demo:league -- <email> [--divisao bronze|prata|ouro|esmeralda] --confirmo\n" +
      "     npm run demo:league -- --remover --confirmo",
  );
  process.exit(1);
}
if (!args.includes("--confirmo")) {
  console.error(
    remove
      ? "Isto apaga as contas teste.liga.*@example.com. Rode de novo com --confirmo."
      : `Isto põe ${email} num grupo de teste da Feira (divisão ${division}) com 12 contas demo.\n` +
          "Só para conta de teste. Rode de novo com --confirmo para seguir.",
  );
  process.exit(1);
}

const secret = env("SUPABASE_SECRET_KEY");
if (!secret.startsWith("sb_secret_")) {
  console.error("SUPABASE_SECRET_KEY precisa ser a chave secreta nova (sb_secret_...).");
  process.exit(1);
}
const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function must(label: string, error: { message: string } | null) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function allUsers() {
  const users: { id: string; email?: string }[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }
  return users;
}

const demoEmail = (i: number) => `teste.liga.${String(i + 1).padStart(2, "0")}@example.com`;
const users = await allUsers();

if (remove) {
  const targets = users.filter((u) => /^teste\.liga\.\d+@example\.com$/.test(u.email ?? ""));
  for (const u of targets) must("apagar conta", (await supabase.auth.admin.deleteUser(u.id)).error);
  console.log(`✓ ${targets.length} contas teste.liga.* apagadas.`);
  process.exit(0);
}

const target = users.find((u) => u.email?.toLowerCase() === email!.toLowerCase());
if (!target) throw new Error(`Usuário não encontrado: ${email}`);

const week = weekStart(localDay(new Date(), "America/Sao_Paulo"));
const { data: weekRow } = await supabase
  .from("league_weeks")
  .select("closed_at")
  .eq("week_start", week)
  .maybeSingle();
if (!weekRow) {
  console.error(
    `A semana ${week} ainda não foi aberta. Rode antes: npm run league:close -- --confirmo`,
  );
  process.exit(1);
}
if (weekRow.closed_at) {
  console.error(`A semana ${week} já foi fechada. Espere a próxima segunda para outro teste.`);
  process.exit(1);
}

// Contas demo ------------------------------------------------------------------
const demoIds: string[] = [];
for (const [i, [username, , isPublic]] of DEMOS.entries()) {
  let id = users.find((u) => u.email === demoEmail(i))?.id;
  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoEmail(i),
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { display_name: `Demo ${username}` },
    });
    must("criar conta demo", error);
    id = data.user!.id;
  }
  must(
    "perfil demo",
    (
      await supabase
        .from("profiles")
        .update({
          is_demo: true,
          // Fora da Feira: entram no grupo de teste direto, e assim o cron de segunda
          // não as coloca nos grupos reais.
          league_opt_in: false,
          public_profile: isPublic,
          username,
          league_division: division,
          onboarding_step: "concluido",
        })
        .eq("id", id)
    ).error,
  );
  demoIds.push(id);
}

// Conta de teste ----------------------------------------------------------------
const { data: targetProfile } = await supabase
  .from("profiles")
  .select("username")
  .eq("id", target.id)
  .single();
must(
  "perfil de teste",
  (
    await supabase
      .from("profiles")
      .update({
        league_opt_in: true,
        league_division: division,
        ...(targetProfile?.username ? {} : { username: "teste.liga" }),
      })
      .eq("id", target.id)
  ).error,
);

// Grupo novo da semana com todo mundo ----------------------------------------------
const everyone = [target.id, ...demoIds];
must(
  "sair dos grupos atuais",
  (await supabase.from("league_members").delete().eq("week_start", week).in("user_id", everyone))
    .error,
);
const { data: group, error: gErr } = await supabase
  .from("league_groups")
  .insert({ week_start: week, division, band_min: 0, band_max: 3 })
  .select("id")
  .single();
must("criar grupo", gErr);
must(
  "membros",
  (
    await supabase
      .from("league_members")
      .insert(everyone.map((user_id) => ({ group_id: group!.id, user_id, week_start: week })))
  ).error,
);

// Ciclos concluídos nesta semana + XP pelo servidor (apply_xp) ------------------------
const start = zonedMidnight(week, "America/Sao_Paulo").getTime();
const now = Date.now();
for (const [i, [username, pomodoros]] of DEMOS.entries()) {
  if (pomodoros === 0) continue;
  const id = demoIds[i]!;
  const rows = Array.from({ length: pomodoros }, (_, j) => {
    const end = start + ((now - start) * (j + 1)) / (pomodoros + 1);
    return {
      user_id: id,
      planned_focus_sec: 1500,
      started_at: new Date(end - 25 * 60_000).toISOString(),
      ended_at: new Date(end).toISOString(),
      status: "completed",
      paused_sec: 0,
      pauses: 0,
    };
  });
  const { data: sessions, error } = await supabase
    .from("pomodoro_sessions")
    .insert(rows)
    .select("id");
  must(`ciclos de ${username}`, error);
  const events = (sessions ?? []).map((s) => ({
    source: "pomodoro",
    amount: 10,
    ref_id: s.id,
    dedupe_key: `pomodoro:${s.id}`,
  }));
  const { data: xp, error: xpErr } = await supabase.rpc("apply_xp", {
    p_user: id,
    p_events: events,
  });
  must(`XP de ${username}`, xpErr);
  const total = (xp as { new_total: number }[] | null)?.[0]?.new_total ?? 0;
  must(
    `nível de ${username}`,
    (
      await supabase
        .from("profiles")
        .update({ level: levelForXp(total) })
        .eq("id", id)
    ).error,
  );
}

console.log(
  `✓ Grupo de ${everyone.length} na Feira de ${division} (semana de ${week}) com ${email}.`,
);
console.log("  Abra a Liga com a conta de teste. Para fechar a semana agora:");
console.log("  npm run league:close -- --fechar-semana-atual --confirmo");
