import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthRedirect } from "@/lib/auth/routes";
import { publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Renova a sessão do Supabase a cada requisição e aplica o controle de rotas
 * protegidas. Chamado por `proxy.ts` (antigo middleware).
 */
export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabasePublishableKey } = publicEnv();
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        cacheHeaders = { ...cacheHeaders, ...headers };
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Não coloque código entre a criação do cliente e getClaims():
  // é aqui que o token é validado/renovado.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const target = resolveAuthRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search,
    isAuthenticated,
  );
  if (!target) return response;

  const redirect = NextResponse.redirect(new URL(target, request.url));
  // Preserva cookies renovados (senão a sessão se perde no redirecionamento).
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  for (const [key, value] of Object.entries(cacheHeaders)) redirect.headers.set(key, value);
  return redirect;
}
