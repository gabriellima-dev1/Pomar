import { describe, expect, it } from "vitest";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "./errors";

describe("authErrorMessage", () => {
  it("traduz códigos conhecidos", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe("E-mail ou senha incorretos.");
    expect(authErrorMessage({ code: "user_already_exists" })).toMatch(/Já existe uma conta/);
  });

  it("trata 429 como limite de tentativas", () => {
    expect(authErrorMessage({ status: 429 })).toMatch(/Muitas tentativas/);
  });

  it("usa mensagem genérica para o resto", () => {
    expect(authErrorMessage({ code: "algo_novo", message: "Internal" })).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(null)).toBe(GENERIC_AUTH_ERROR);
  });
});
