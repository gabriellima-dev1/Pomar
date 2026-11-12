import { defineConfig } from "@playwright/test";

/**
 * Testes ponta a ponta (Fase 5/6). Rodam no build de produção local (porta 3100) com o
 * banco do Supabase, usando contas de teste criadas e apagadas por cada arquivo.
 *
 *   npm run test:e2e                       # faz o build, sobe o app e roda
 *   E2E_BASE_URL=https://... npm run test:e2e   # contra outro endereço (ex.: produção)
 *
 * Usa o Chrome instalado (sem baixar navegador). Um teste por vez: os arquivos
 * compartilham o banco.
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  // Na CI as variáveis vêm do ambiente.
}

const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  outputDir: ".e2e-resultados",
  use: {
    baseURL: external ?? "http://localhost:3100",
    channel: "chrome",
    locale: "pt-BR",
    timezoneId: "America/Maceio",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: external
    ? undefined
    : {
        command: "npm run build && npx next start -p 3100",
        url: "http://localhost:3100",
        reuseExistingServer: true,
        timeout: 400_000,
      },
});
