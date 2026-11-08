import { describe, expect, it } from "vitest";
import { hasErrors, parseSignup, validateLogin, validateSignup } from "./validation";

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("parseSignup", () => {
  it("normaliza e-mail e nome", () => {
    expect(
      parseSignup(form({ displayName: "  Ana  ", email: " Ana@UFAL.br ", password: "segredo123" })),
    ).toEqual({ displayName: "Ana", email: "ana@ufal.br", password: "segredo123" });
  });

  it("campos ausentes viram string vazia", () => {
    expect(parseSignup(new FormData())).toEqual({ displayName: "", email: "", password: "" });
  });
});

describe("validateSignup", () => {
  it("aceita dados válidos", () => {
    const errors = validateSignup({ displayName: "Ana", email: "a@b.co", password: "12345678" });
    expect(hasErrors(errors)).toBe(false);
  });

  it("aponta cada campo inválido", () => {
    const errors = validateSignup({ displayName: "", email: "sem-arroba", password: "123" });
    expect(Object.keys(errors).sort()).toEqual(["displayName", "email", "password"]);
  });

  it("limita o nome a 60 caracteres", () => {
    const errors = validateSignup({
      displayName: "a".repeat(61),
      email: "a@b.co",
      password: "12345678",
    });
    expect(errors.displayName).toBeDefined();
  });
});

describe("validateLogin", () => {
  it("exige e-mail e senha", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Informe um e-mail válido.",
      password: "Informe sua senha.",
    });
  });
});
