import { describe, expect, it } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it.each([
    ["/inicio", "/inicio"],
    ["/disciplinas/123?aba=topicos", "/disciplinas/123?aba=topicos"],
    ["/pomodoro#topo", "/pomodoro#topo"],
    ["/a/../inicio", "/inicio"],
  ])("aceita caminho interno %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/\n/evil.com",
    "/\\/evil.com",
    "",
  ])("rejeita %j", (input) => {
    expect(safeNext(input)).toBe("/inicio");
  });

  it("rejeita valores que não são string", () => {
    expect(safeNext(null)).toBe("/inicio");
    expect(safeNext(undefined)).toBe("/inicio");
    expect(safeNext(["/inicio"])).toBe("/inicio");
  });

  it("usa o fallback informado", () => {
    expect(safeNext("//x", "/login")).toBe("/login");
  });
});
