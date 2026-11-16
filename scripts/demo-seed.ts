/**
 * Contas DEMO da apresentação (PLANO Fase 6): 12 pessoas `demo.<apelido>@example.com`,
 * com selo "demo" (is_demo), na Feira (opt-in) e com algumas semanas de pomodoros.
 * Ficam fora das métricas do /admin (por padrão) e dos números da landing.
 *
 * Uso: npm run demo:seed -- [dias=21] --confirmo
 *      npm run demo:seed -- --remover --confirmo     (apaga as contas demo.*)
 *      (lê .env.local; precisa de SUPABASE_SECRET_KEY)
 *
 * Rodar de novo só acrescenta os dias que faltam (até hoje) e fecha os dias pelo
 * servidor. Os emblemas, colheitas, ofensiva e XP saem de `ensureDaysClosed`
 * (lib/gamification/service.ts), a mesma função que roda quando alguém abre o app.
 * Dica para a apresentação: rodar de novo no dia (ou na véspera) faz o XP dos ciclos
 * da semana cair na Feira da semana em andamento.
 */
import { createClient } from "@supabase/supabase-js";
import { addDays, dayRange, localDay } from "@/lib/dates";
import { DEMO_EMAIL_RE, DEMO_PERSONAS, DEMO_TZ, demoEmail, plannedSessions } from "@/lib/demo-plan";
import { ensureDaysClosed } from "@/lib/gamification/service";

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
const days = Number(args.find((a) => /^\d+$/.test(a)) ?? 21);
if (!Number.isInteger(days) || days < 1 || days > 60) {
  console.error("Uso: npm run demo:seed -- [dias de 1 a 60] --confirmo");
  process.exit(1);
}
if (!args.includes("--confirmo")) {
  console.error(
    remove
      ? "Isto apaga as 12 contas demo.*@example.com e tudo delas. Rode de novo com --confirmo."
      : `Isto cria (ou atualiza) 12 contas demo com ${days} dias de pomodoros e as coloca na Feira.\n` +
          "Rode de novo com --confirmo para seguir.",
  );
  process.exit(1);
}

const secret = env("SUPABASE_SECRET_KEY");
if (!secret.startsWith("sb_secret_")) {
  console.error("SUPABASE_SECRET_KEY precisa ser a chave secreta nova (sb_secret_...).");
  process.exit(1);
}
const db = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function must(label: string, error: { message: string } | null) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function allUsers() {
  const users: { id: string; email?: string }[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }
  return users;
}

const users = await allUsers();

if (remove) {
  const targets = users.filter((u) => DEMO_EMAIL_RE.test(u.email ?? ""));
  for (const u of targets) must("apagar conta", (await db.auth.admin.deleteUser(u.id)).error);
  console.log(`✓ ${targets.length} contas demo apagadas.`);
  process.exit(0);
}

const now = new Date();
const today = localDay(now, DEMO_TZ);
const window = dayRange(addDays(today, -(days - 1)), today);

for (const persona of DEMO_PERSONAS) {
  const email = demoEmail(persona.username);
  let id = users.find((u) => u.email === email)?.id;
  const isNew = !id;
  if (!id) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { display_name: persona.name, timezone: DEMO_TZ },
    });
    must(`criar ${email}`, error);
    id = data.user!.id;
  }

  must(
    `perfil de ${persona.username}`,
    (
      await db
        .from("profiles")
        .update({
          is_demo: true,
          display_name: persona.name,
          username: persona.username,
          public_profile: persona.isPublic,
          league_opt_in: true,
          onboarding_step: "concluido",
          bartle_primary: persona.bartle,
          theme: persona.theme,
          timezone: DEMO_TZ,
          // Conta nova: o fechamento começa no 1º dia da janela.
          ...(isNew ? { last_closed_day: addDays(window[0]!, -1) } : {}),
        })
        .eq("id", id)
    ).error,
  );
  must(
    `coorte de ${persona.username}`,
    (await db.from("user_cohorts").upsert({ user_id: id, cohort: "A" }, { onConflict: "user_id" }))
      .error,
  );

  // Dias que já têm ciclo (rodar de novo não duplica).
  const { data: existing, error: exErr } = await db
    .from("pomodoro_sessions")
    .select("started_at")
    .eq("user_id", id)
    .gte("started_at", new Date(`${addDays(window[0]!, -1)}T00:00:00Z`).toISOString());
  must(`ciclos de ${persona.username}`, exErr);
  const skip = new Set((existing ?? []).map((s) => localDay(new Date(s.started_at), DEMO_TZ)));

  const plan = plannedSessions(persona, window, skip, now);
  if (plan.length > 0) {
    must(
      `gravar ciclos de ${persona.username}`,
      (
        await db.from("pomodoro_sessions").insert(
          plan.map((s) => ({
            user_id: id,
            planned_focus_sec: 1500,
            started_at: s.startedAt,
            ended_at: s.endedAt,
            status: "completed",
            paused_sec: 0,
            pauses: 0,
          })),
        )
      ).error,
    );
  }

  // Emblemas, colheitas, ofensiva e XP: o mesmo fechamento de quando a pessoa abre o app.
  await ensureDaysClosed(id, now);

  const { data: p } = await db
    .from("profiles")
    .select("xp_total, level, streak_current")
    .eq("id", id)
    .single();
  console.log(
    `✓ @${persona.username.padEnd(12)} +${String(plan.length).padStart(3)} ciclos · nível ${p?.level} · ${p?.xp_total} XP · ofensiva ${p?.streak_current}`,
  );
}

console.log(
  "\nAs contas entram nos grupos da Feira na próxima virada (segunda 00:00) ou com\n" +
    "npm run league:close -- --confirmo. Elas têm o selo demo e ficam fora das métricas.",
);
