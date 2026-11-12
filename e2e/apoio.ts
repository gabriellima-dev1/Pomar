/**
 * Apoio dos testes ponta a ponta: contas de teste (is_demo) criadas pela chave secreta,
 * login por cookie de sessão e leituras do banco para conferir o que a tela fez.
 * Cada arquivo cria as próprias contas e apaga tudo no fim.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ausente: ${name} (configure em .env.local).`);
  return value;
}

let cached: SupabaseClient | null = null;
export function db(): SupabaseClient {
  cached ??= createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function ok<R extends { data: unknown; error: { message: string } | null }>(
  label: string,
  res: R,
): NonNullable<R["data"]> {
  if (res.error) throw new Error(`${label}: ${res.error.message}`);
  return res.data as NonNullable<R["data"]>;
}

export type Conta = { id: string; email: string; password: string; apelido: string };

const RUN = Date.now().toString(36);

/** Conta de teste pronta para usar o app (onboarding concluído, coorte A, is_demo). */
export async function criarConta(
  nome: string,
  perfil: Record<string, unknown> = {},
): Promise<Conta> {
  const email = `e2e.${RUN}.${nome}@example.com`;
  const password = randomUUID();
  const created = ok(
    "criar conta",
    await db().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: `E2E ${nome}` },
    }),
  );
  const id = created.user!.id;
  const apelido = `e2e${RUN}${nome}`.slice(0, 20).toLowerCase();
  ok(
    "perfil",
    await db()
      .from("profiles")
      .update({
        is_demo: true,
        timezone: "America/Maceio",
        onboarding_step: "concluido",
        bartle_primary: "conquistador",
        username: apelido,
        public_profile: true,
        league_opt_in: false,
        ...perfil,
      })
      .eq("id", id),
  );
  ok(
    "coorte",
    await db().from("user_cohorts").upsert({ user_id: id, cohort: "A" }, { onConflict: "user_id" }),
  );
  return { id, email, password, apelido };
}

export async function apagarContas(contas: (Conta | undefined)[]): Promise<void> {
  for (const c of contas) if (c) await db().auth.admin.deleteUser(c.id);
}

/** Entra como a conta (cookie de sessão do @supabase/ssr), sem passar pela tela de login. */
export async function entrar(
  context: BrowserContext,
  conta: Conta,
  baseURL: string,
): Promise<void> {
  const anon = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  const { data, error } = await anon.auth.signInWithPassword({
    email: conta.email,
    password: conta.password,
  });
  if (error || !data.session) throw new Error(`login: ${error?.message}`);
  const ref = new URL(env("NEXT_PUBLIC_SUPABASE_URL")).hostname.split(".")[0];
  const value = `base64-${Buffer.from(JSON.stringify(data.session)).toString("base64url")}`;
  const name = `sb-${ref}-auth-token`;
  const url = new URL(baseURL).origin;
  const CHUNK = 3180;
  const cookies =
    value.length <= CHUNK
      ? [{ name, value, url }]
      : Array.from({ length: Math.ceil(value.length / CHUNK) }, (_, i) => ({
          name: `${name}.${i}`,
          value: value.slice(i * CHUNK, (i + 1) * CHUNK),
          url,
        }));
  await context.addCookies(cookies);
}

/** Disciplina manual com 1 capítulo e 1 tópico de 10 páginas (e um ciclo concluído, se pedido). */
export async function criarDisciplina(
  conta: Conta,
  titulo: string,
  { comCiclo = false } = {},
): Promise<{ subjectId: string; topicId: string; topicTitle: string }> {
  const subject = ok(
    "disciplina",
    await db()
      .from("subjects")
      .insert({ user_id: conta.id, title: titulo, source: "manual", color: "ceu" })
      .select("id")
      .single(),
  );
  const chapter = ok(
    "capítulo",
    await db()
      .from("chapters")
      .insert({ subject_id: subject.id, position: 1, title: "Capítulo 1" })
      .select("id")
      .single(),
  );
  const topicTitle = "Tópico de teste";
  const topic = ok(
    "tópico",
    await db()
      .from("topics")
      .insert({
        chapter_id: chapter.id,
        position: 1,
        title: topicTitle,
        page_start: 1,
        page_end: 10,
      })
      .select("id")
      .single(),
  );
  if (comCiclo) {
    const start = new Date(Date.now() - 2 * 3600_000);
    ok(
      "ciclo",
      await db()
        .from("pomodoro_sessions")
        .insert({
          user_id: conta.id,
          subject_id: subject.id,
          topic_id: topic.id,
          planned_focus_sec: 1500,
          started_at: start.toISOString(),
          ended_at: new Date(start.getTime() + 1500_000).toISOString(),
          status: "completed",
        }),
    );
  }
  return { subjectId: subject.id, topicId: topic.id, topicTitle };
}

/** Quantos eventos de telemetria com esse nome a conta registrou. */
export async function eventos(conta: Conta, name: string): Promise<number> {
  const { count } = await db()
    .from("telemetry_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", conta.id)
    .eq("name", name);
  return count ?? 0;
}

/** Segunda-feira (AAAA-MM-DD) da semana que contém o dia. */
export function segundaDe(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
