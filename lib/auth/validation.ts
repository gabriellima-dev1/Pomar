export const PASSWORD_MIN_LENGTH = 8;
export const DISPLAY_NAME_MAX_LENGTH = 60;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { displayName: string };

function str(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value : "";
}

export function parseLogin(form: FormData): LoginInput {
  return {
    email: str(form.get("email")).trim().toLowerCase(),
    password: str(form.get("password")),
  };
}

export function parseSignup(form: FormData): SignupInput {
  return { ...parseLogin(form), displayName: str(form.get("displayName")).trim() };
}

export function validateLogin(input: LoginInput): FieldErrors<keyof LoginInput> {
  const errors: FieldErrors<keyof LoginInput> = {};
  if (!EMAIL_RE.test(input.email)) errors.email = "Informe um e-mail válido.";
  if (!input.password) errors.password = "Informe sua senha.";
  return errors;
}

export function validateSignup(input: SignupInput): FieldErrors<keyof SignupInput> {
  const errors: FieldErrors<keyof SignupInput> = {};
  if (!input.displayName) errors.displayName = "Como podemos te chamar?";
  else if (input.displayName.length > DISPLAY_NAME_MAX_LENGTH)
    errors.displayName = `Use até ${DISPLAY_NAME_MAX_LENGTH} caracteres.`;
  if (!EMAIL_RE.test(input.email)) errors.email = "Informe um e-mail válido.";
  if (input.password.length < PASSWORD_MIN_LENGTH)
    errors.password = `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
