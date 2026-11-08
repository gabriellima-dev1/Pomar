export type AuthErrorLike = { code?: string | null; message?: string | null; status?: number };

const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  user_already_exists: "Já existe uma conta com este e-mail. Que tal entrar?",
  email_exists: "Já existe uma conta com este e-mail. Que tal entrar?",
  weak_password: "Essa senha é fraca. Use pelo menos 8 caracteres, misturando letras e números.",
  email_address_invalid: "Esse e-mail não parece válido.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  over_email_send_rate_limit: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  signup_disabled: "O cadastro está temporariamente desativado.",
  provider_disabled: "Esse tipo de login não está disponível no momento.",
  user_banned: "Esta conta está suspensa.",
};

export const GENERIC_AUTH_ERROR = "Não foi possível concluir agora. Tente de novo em instantes.";

/** Traduz um erro do Supabase Auth para uma mensagem amigável em português. */
export function authErrorMessage(error: AuthErrorLike | null | undefined): string {
  if (!error) return GENERIC_AUTH_ERROR;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]!;
  if (error.status === 429) return MESSAGES.over_request_rate_limit!;
  return GENERIC_AUTH_ERROR;
}

/** Mensagens para o parâmetro `?erro=` vindo do callback OAuth. */
export const CALLBACK_ERRORS: Record<string, string> = {
  google: "Não conseguimos entrar com o Google. Tente de novo.",
  link: "Esse link de acesso expirou ou já foi usado.",
};
