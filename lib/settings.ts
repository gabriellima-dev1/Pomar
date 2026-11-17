/**
 * Regras puras das Configurações (telas.md › 31 e 32).
 */

/** Sem apelido, a confirmação da exclusão é digitar esta palavra. */
export const DELETE_WORD = "EXCLUIR";

/** O que a pessoa precisa digitar para excluir a conta: o apelido ou "EXCLUIR". */
export function deleteConfirmationTarget(username: string | null): string {
  return username?.trim() ? username.trim() : DELETE_WORD;
}

/** A confirmação bate? (sem diferenciar maiúsculas e ignorando espaços nas pontas) */
export function deleteConfirmationMatches(typed: string, username: string | null): boolean {
  const target = deleteConfirmationTarget(username);
  return typed.trim().toLocaleLowerCase("pt-BR") === target.toLocaleLowerCase("pt-BR");
}

export const NAME_MAX = 60;

/** Nome mostrado no app: espaços colapsados, 1 a 60 caracteres; `null` se inválido. */
export function normalizeDisplayName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length === 0 || name.length > NAME_MAX) return null;
  return name;
}

/** Resumo do ciclo na linha "Ciclo do pomodoro". */
export function cycleSummary(focus: number, shortBreak: number, longBreak: number): string {
  return `Foco ${focus} · descanso ${shortBreak} · longo ${longBreak} min`;
}

/** Método de login para a linha do e-mail. */
export function loginMethodLabel(provider: string | null | undefined): string {
  return provider === "google" ? "entra com Google" : "entra com e-mail e senha";
}
