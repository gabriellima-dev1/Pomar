import type { ReactNode } from "react";

/** Corpo de uma tela do onboarding: coluna com a ação principal no pé. */
export function OnboardingBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-1 flex-col gap-5 px-4 pt-6 pb-6 lg:min-h-[720px] lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

/** Pé da tela com as ações (primária em cima, alternativas abaixo). */
export function OnboardingActions({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex flex-col gap-3 pt-4">{children}</div>;
}

/** Rótulo "PASSO N DE 5" (telas 18 e 19). */
export function StepLabel({ step, done = false }: { step: number; done?: boolean }) {
  return (
    <p className="text-caption text-ink-muted">
      Passo {step} de 5{done ? " · concluído" : ""}
    </p>
  );
}
