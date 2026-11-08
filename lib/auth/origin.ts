/**
 * Origem da requisição atual (funciona em localhost, previews e produção da Vercel).
 * Usa `fallback` (NEXT_PUBLIC_APP_URL) quando os cabeçalhos não ajudam.
 */
export function originFromHeaders(
  headers: { get(name: string): string | null },
  fallback?: string,
): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (host && /^[a-z0-9.-]+(:\d+)?$/i.test(host)) {
    const proto =
      headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    if (proto === "http" || proto === "https") return `${proto}://${host}`;
  }
  return (fallback ?? "http://localhost:3000").replace(/\/$/, "");
}
