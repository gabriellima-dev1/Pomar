import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * "Exportar meus dados" (telas.md › 31, DESIGN §10 anti-roach motel): `GET /api/export`
 * baixa um JSON com tudo o que é da pessoa. As tabelas vêm pela sessão (a RLS limita às
 * linhas dela); os eventos de telemetria, que só o admin lê, vêm pela chave secreta
 * filtrados pelo `user_id` da sessão.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "login" }, { status: 401 });

  const supabase = await createClient();
  const me = user.id;
  const [
    perfil,
    coorte,
    disciplinas,
    calibracoes,
    pomodoros,
    xp,
    emblemas,
    colheitas,
    temas,
    seguindo,
    feira,
    conquistasNoFeed,
    parabensDados,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", me).maybeSingle(),
    supabase
      .from("user_cohorts")
      .select("cohort, assigned_at, left_at")
      .eq("user_id", me)
      .maybeSingle(),
    supabase
      .from("subjects")
      .select(
        "id, title, source, color, goal_date, daily_goal, min_per_page, video_speed, created_at, chapters(position, title, topics(position, title, page_start, page_end, duration_sec, done_at))",
      )
      .eq("user_id", me),
    supabase.from("calibrations").select("*").eq("user_id", me),
    supabase.from("pomodoro_sessions").select("*").eq("user_id", me),
    supabase.from("xp_events").select("*").eq("user_id", me),
    supabase.from("user_daily_badges").select("*").eq("user_id", me),
    supabase.from("weekly_harvests").select("*").eq("user_id", me),
    supabase.from("user_themes").select("*").eq("user_id", me),
    supabase.from("follows").select("followee_id, created_at").eq("follower_id", me),
    supabase.from("league_members").select("*").eq("user_id", me),
    supabase.from("feed_events").select("*").eq("user_id", me),
    supabase.from("reactions").select("*").eq("user_id", me),
  ]);
  const telemetria = await createAdminClient()
    .from("telemetry_events")
    .select("name, props, created_at")
    .eq("user_id", me)
    .order("created_at", { ascending: true });

  const rows = (res: { data: unknown; error: { message: string } | null }) =>
    res.error ? { erro: "Não consegui ler esta parte agora." } : res.data;

  const body = {
    exportado_em: new Date().toISOString(),
    sobre:
      "Seus dados no Pomar (projeto da disciplina Computação Persuasiva, UFAL). Para excluir a conta, use Configurações › Excluir conta.",
    conta: { id: me, email: user.email },
    perfil: rows(perfil),
    experimento: rows(coorte),
    disciplinas: rows(disciplinas),
    calibracoes: rows(calibracoes),
    pomodoros: rows(pomodoros),
    xp: rows(xp),
    emblemas: rows(emblemas),
    colheitas: rows(colheitas),
    temas: rows(temas),
    seguindo: rows(seguindo),
    feira: rows(feira),
    conquistas_no_feed: rows(conquistasNoFeed),
    parabens_dados: rows(parabensDados),
    eventos_de_uso: rows(telemetria),
  };

  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="pomar-meus-dados-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
