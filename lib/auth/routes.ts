/** Rotas que exigem login (grupo `(app)` e admin). */
export const PROTECTED_PREFIXES = [
  "/inicio",
  "/onboarding",
  "/disciplinas",
  "/calibrar",
  "/pomodoro",
  "/conquistas",
  "/liga",
  "/social",
  "/estatisticas",
  "/configuracoes",
  "/admin",
] as const;

/**
 * Rotas que só fazem sentido sem login. A landing (`/`) também: quem já está logado
 * vai direto para o Início (telas.md › 15).
 */
export const GUEST_ONLY_PATHS = ["/login", "/cadastro"] as const;

export const HOME_PATH = "/inicio";
export const LOGIN_PATH = "/login";

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.some((path) => matchesPrefix(pathname, path));
}

/**
 * Decide para onde redirecionar (ou `null` para seguir).
 * `search` inclui o "?" quando houver.
 */
export function resolveAuthRedirect(
  pathname: string,
  search: string,
  isAuthenticated: boolean,
): string | null {
  if (!isAuthenticated && isProtectedPath(pathname)) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return `${LOGIN_PATH}?next=${next}`;
  }
  if (isAuthenticated && (pathname === "/" || isGuestOnlyPath(pathname))) {
    return HOME_PATH;
  }
  return null;
}
