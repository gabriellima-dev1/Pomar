import { describe, expect, it } from "vitest";
import { originFromHeaders } from "./origin";

const h = (entries: Record<string, string>) => new Headers(entries);

describe("originFromHeaders", () => {
  it("usa x-forwarded-host/proto (Vercel)", () => {
    expect(
      originFromHeaders(
        h({ "x-forwarded-host": "pomar.vercel.app", "x-forwarded-proto": "https" }),
      ),
    ).toBe("https://pomar.vercel.app");
  });

  it("localhost assume http", () => {
    expect(originFromHeaders(h({ host: "localhost:3000" }))).toBe("http://localhost:3000");
  });

  it("host estranho cai no fallback", () => {
    expect(originFromHeaders(h({ host: "evil.com/path" }), "https://pomar.app/")).toBe(
      "https://pomar.app",
    );
  });

  it("sem cabeçalhos usa localhost", () => {
    expect(originFromHeaders(h({}))).toBe("http://localhost:3000");
  });
});
