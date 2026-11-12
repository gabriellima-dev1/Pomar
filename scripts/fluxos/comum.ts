/**
 * Peças comuns dos scripts dos fluxos de telas (docs/fluxos/PLANO.md).
 * Só dependências sem alias (os scripts rodam com `node`, sem o bundler do Next).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const PASTA = join(process.cwd(), ".fluxos");
export const SENHAS = join(PASTA, "senhas.json");
export const TZ = "America/Maceio";

export type PersonaId = "carla" | "diego" | "elisa";

export const PERSONAS: Record<
  PersonaId,
  { email: string; nome: string; apelido: string; perfil: string; publico: boolean }
> = {
  carla: {
    email: "fluxo.carla@example.com",
    nome: "Carla Exemplo",
    apelido: "carla.exemplo",
    perfil: "conquistador",
    publico: true,
  },
  diego: {
    email: "fluxo.diego@example.com",
    nome: "Diego Exemplo",
    apelido: "diego.exemplo",
    perfil: "competidor",
    publico: true,
  },
  elisa: {
    email: "fluxo.elisa@example.com",
    nome: "Elisa Exemplo",
    apelido: "elisa.exemplo",
    perfil: "socializador",
    publico: true,
  },
};

export function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável ausente: ${name}. Configure em .env.local.`);
    process.exit(1);
  }
  return value;
}

export function admin(): SupabaseClient {
  const secret = env("SUPABASE_SECRET_KEY");
  if (!secret.startsWith("sb_secret_")) {
    console.error("SUPABASE_SECRET_KEY precisa ser a chave secreta nova (sb_secret_...).");
    process.exit(1);
  }
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resultado do Supabase ou erro com rótulo. O dado vem sem `null` (o erro já foi checado). */
export function must<R extends { data: unknown; error: { message: string } | null }>(
  label: string,
  res: R,
): NonNullable<R["data"]> {
  if (res.error) throw new Error(`${label}: ${res.error.message}`);
  return res.data as NonNullable<R["data"]>;
}

export function lerSenhas(): Partial<Record<PersonaId, string>> {
  return existsSync(SENHAS)
    ? (JSON.parse(readFileSync(SENHAS, "utf8")) as Record<PersonaId, string>)
    : {};
}

export function salvarSenhas(senhas: Partial<Record<PersonaId, string>>): void {
  mkdirSync(PASTA, { recursive: true });
  writeFileSync(SENHAS, `${JSON.stringify(senhas, null, 2)}\n`, { mode: 0o600 });
}

/** Ids das contas pelo e-mail (null se ainda não existe). */
export async function idsDasContas(db: SupabaseClient): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) if (u.email) ids.set(u.email.toLowerCase(), u.id);
    if (data.users.length < 200) break;
  }
  return ids;
}

/** Instante "dia local às hh:mm" em America/Maceio (UTC−3, sem horário de verão). */
export function emMaceio(day: string, hour: number, minute = 0): Date {
  return new Date(Date.parse(`${day}T00:00:00Z`) + ((hour + 3) * 60 + minute) * 60_000);
}
