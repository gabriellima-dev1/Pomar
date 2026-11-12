/**
 * Apelido (telas.md › 24): 3 a 20 caracteres, letras minúsculas, números, `.` e `_`.
 * Mesma regra do `check` de profiles.username (migração da Feira).
 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/;

export type UsernameProblem = "curto" | "longo" | "formato";

export const USERNAME_PROBLEM_TEXT: Record<UsernameProblem, string> = {
  curto: "Use pelo menos 3 caracteres",
  longo: "Use no máximo 20 caracteres",
  formato: "Só letras minúsculas, números, ponto e _",
};

/** Normaliza o que a pessoa digita: tira o "@" do começo, espaços e maiúsculas. */
export function normalizeUsernameInput(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function usernameProblem(value: string): UsernameProblem | null {
  if (value.length < USERNAME_MIN) return "curto";
  if (value.length > USERNAME_MAX) return "longo";
  if (!USERNAME_PATTERN.test(value)) return "formato";
  return null;
}

function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Sugestão a partir do nome ("Gabriel Ferreira Lima" → "gabriel.lima") ou da parte
 * local do e-mail. Sem nada aproveitável, "estudante".
 */
export function suggestUsername(name: string | null, email?: string | null): string {
  const words = slug(name ?? "")
    .split(" ")
    .filter(Boolean);
  let base =
    words.length > 1
      ? `${words[0]}.${words.at(-1)}`
      : (words[0] ?? slug(email?.split("@")[0] ?? "").replace(/ /g, "."));
  base = base.replace(/[^a-z0-9._]/g, "").slice(0, USERNAME_MAX);
  if (base.length < USERNAME_MIN) base = "estudante";
  return base;
}

/** "gabriel.lima" + 2 → "gabriel.lima2", cortando a base para caber em 20. */
export function withSuffix(base: string, n: number): string {
  if (n <= 1) return base;
  const suffix = String(n);
  return `${base.slice(0, USERNAME_MAX - suffix.length)}${suffix}`;
}

/** Primeiro apelido livre: base, base2, base3… */
export function firstFreeUsername(base: string, taken: ReadonlySet<string>): string {
  for (let n = 1; ; n++) {
    const candidate = withSuffix(base, n);
    if (!taken.has(candidate)) return candidate;
  }
}

/** Iniciais do avatar: "lucas.m" → "LM", "tiago_s" → "TS", "bia" → "BI". */
export function initials(username: string | null): string {
  if (!username) return "?";
  const parts = username.split(/[._]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return username.replace(/[._]/g, "").slice(0, 2).toUpperCase();
}
