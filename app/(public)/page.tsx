import Link from "next/link";
import { TrackOnMount } from "@/components/telemetry/TrackOnMount";

/** Landing provisória. A versão completa (contadores reais etc.) é da Fase 4. */
export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <TrackOnMount event="landing_viewed" />
      <p className="text-5xl" aria-hidden="true">
        🍅
      </p>
      <h1 className="text-4xl font-bold">Pomar</h1>
      <p className="text-muted max-w-md text-lg">
        Organize o que você precisa estudar, foque com a técnica Pomodoro e colha um fruto a cada
        ciclo concluído.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/cadastro"
          className="bg-primary text-primary-foreground flex min-h-11 items-center justify-center rounded-lg px-6 font-semibold"
        >
          Criar conta grátis
        </Link>
        <Link
          href="/login"
          className="border-border bg-surface flex min-h-11 items-center justify-center rounded-lg border px-6 font-semibold"
        >
          Já tenho conta
        </Link>
      </div>
    </main>
  );
}
