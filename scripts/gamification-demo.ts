/**
 * Prepara uma CONTA DE TESTE para conferir o aceite da Fase 3 no preview.
 * Uso: npm run demo:week -- <email> [dias=5] --confirmo
 *      (lê .env.local; precisa de SUPABASE_SECRET_KEY)
 *
 * Cria pomodoros concluídos (25 min, sem pausa) do 1º ao N-ésimo dia da SEMANA PASSADA
 * (segunda em diante), apaga os emblemas, colheitas e temas conquistados da conta e
 * faz o fechamento recomeçar do domingo anterior. Ao abrir o app, o servidor fecha os
 * dias: 1 emblema por dia com pomodoro; 5 dias → Colheita de Prata + Halloween;
 * 7 dias → Ouro + Natal. Nunca use numa conta real: os dados de gamificação dela somem.
 */
import { createClient } from "@supabase/supabase-js";
import { addDays, localDay, weekStart } from "../lib/dates.ts";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável ausente: ${name}. Configure em .env.local.`);
    process.exit(1);
  }
  return value;
}

const args = process.argv.slice(2);
const email = args.find((a) => a.includes("@"));
const days = Number(args.find((a) => /^\d+$/.test(a)) ?? 5);
if (!email || !Number.isInteger(days) || days < 1 || days > 7) {
  console.error("Uso: npm run demo:week -- <email> [dias de 1 a 7] --confirmo");
  process.exit(1);
}
if (!args.includes("--confirmo")) {
  console.error(
    `Isto apaga emblemas, colheitas e temas de ${email} e cria ${days} pomodoros na semana passada.\n` +
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

async function findUserId(target: string): Promise<string> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const user = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (user) return user.id;
    if (data.users.length < 200) break;
  }
  throw new Error(`Usuário não encontrado: ${target}`);
}

function must(label: string, error: { message: string } | null) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

const userId = await findUserId(email);
const { data: profile, error: pErr } = await supabase
  .from("profiles")
  .select("timezone, created_at")
  .eq("id", userId)
  .single();
must("perfil", pErr);
const tz = profile!.timezone as string;
const today = localDay(new Date(), tz);
const monday = addDays(weekStart(today), -7);
const studyDays = Array.from({ length: days }, (_, i) => addDays(monday, i));

must(
  "apagar emblemas",
  (await supabase.from("user_daily_badges").delete().eq("user_id", userId).gte("day", monday))
    .error,
);
must(
  "apagar colheitas",
  (await supabase.from("weekly_harvests").delete().eq("user_id", userId).gte("week_start", monday))
    .error,
);
must("apagar temas", (await supabase.from("user_themes").delete().eq("user_id", userId)).error);

// Meio-dia (UTC−3) de cada dia; 25 min de foco, sem pausa.
const rows = studyDays.map((day) => {
  const start = new Date(`${day}T15:00:00Z`);
  return {
    user_id: userId,
    planned_focus_sec: 1500,
    started_at: start.toISOString(),
    ended_at: new Date(start.getTime() + 25 * 60_000).toISOString(),
    status: "completed",
    paused_sec: 0,
    pauses: 0,
  };
});
must("criar pomodoros", (await supabase.from("pomodoro_sessions").insert(rows)).error);

must(
  "recomeçar o fechamento",
  (
    await supabase
      .from("profiles")
      .update({
        last_closed_day: addDays(monday, -1),
        streak_current: 0,
        freezes: 0,
        theme: null,
      })
      .eq("id", userId)
  ).error,
);

console.log(`✓ ${email}: ${days} pomodoros de ${studyDays[0]} a ${studyDays.at(-1)} (${tz}).`);
console.log("  Abra o app: os frutos aparecem um por um e, com 5+ dias, o tema desbloqueado.");
