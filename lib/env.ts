/**
 * Variáveis públicas (disponíveis no navegador). O acesso a `process.env.X`
 * precisa ser literal para o Next.js embutir o valor no bundle do cliente.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Configure em .env.local (local) ou nas variáveis de ambiente da Vercel.`,
    );
  }
  return value;
}

export function publicEnv() {
  return {
    supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}
