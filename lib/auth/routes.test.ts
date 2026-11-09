import { describe, expect, it } from "vitest";
import { isGuestOnlyPath, isProtectedPath, resolveAuthRedirect } from "./routes";

describe("isProtectedPath", () => {
  it.each(["/inicio", "/disciplinas/abc", "/calibrar", "/admin", "/configuracoes"])(
    "%s é protegida",
    (p) => {
      expect(isProtectedPath(p)).toBe(true);
    },
  );

  it.each(["/", "/login", "/cadastro", "/transparencia", "/auth/callback", "/iniciotalvez"])(
    "%s é pública",
    (p) => {
      expect(isProtectedPath(p)).toBe(false);
    },
  );
});

describe("isGuestOnlyPath", () => {
  it("login e cadastro são só para visitantes", () => {
    expect(isGuestOnlyPath("/login")).toBe(true);
    expect(isGuestOnlyPath("/cadastro")).toBe(true);
    expect(isGuestOnlyPath("/")).toBe(false);
  });
});

describe("resolveAuthRedirect", () => {
  it("visitante em rota protegida vai para o login com next", () => {
    expect(resolveAuthRedirect("/disciplinas/1", "?aba=x", false)).toBe(
      "/login?next=%2Fdisciplinas%2F1%3Faba%3Dx",
    );
  });

  it("usuário logado no login vai para o início", () => {
    expect(resolveAuthRedirect("/login", "", true)).toBe("/inicio");
  });

  it("nos demais casos segue sem redirecionar", () => {
    expect(resolveAuthRedirect("/inicio", "", true)).toBeNull();
    expect(resolveAuthRedirect("/login", "", false)).toBeNull();
    expect(resolveAuthRedirect("/", "", false)).toBeNull();
    expect(resolveAuthRedirect("/", "", true)).toBeNull();
  });
});
