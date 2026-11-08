import { HOME_PATH } from "./routes";

const BASE = "http://pomar.invalid";

/**
 * Aceita apenas caminhos internos para o parâmetro `next` (evita open redirect).
 * Retorna `fallback` para qualquer coisa suspeita.
 */
export function safeNext(next: unknown, fallback: string = HOME_PATH): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;

  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
