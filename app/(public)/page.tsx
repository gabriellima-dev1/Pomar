import Link from "next/link";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { buttonClasses } from "@/components/ui/Button";

/** Landing provisória. A versão completa (contadores reais etc.) é da Fase 4. */
export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <TrackOnMount event="landing_viewed" />
      <SeuTomas size={112} />
      <h1 className="text-display">Pomar</h1>
      <p className="text-ink-muted max-w-md text-lg">
        Organize o que você precisa estudar, foque com a técnica Pomodoro e colha um fruto a cada
        ciclo concluído.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link href="/cadastro" className={buttonClasses("primary", "lg")}>
          Criar conta grátis
        </Link>
        <Link href="/login" className={buttonClasses("secondary", "lg")}>
          Já tenho conta
        </Link>
      </div>
      <footer className="text-ink-muted mt-6 text-sm">
        <Link href="/privacidade" className="underline">
          Política de Privacidade
        </Link>
      </footer>
    </main>
  );
}
