"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { openRewardsQueue } from "./rewardsQueueSignal";

/**
 * Cartão "Fruto de ontem" com fruto pendente: o toque reabre a fila de recompensas
 * (telas.md › 12). Se a fila já estiver vazia (página desatualizada), abre o álbum.
 */
export function HarvestButton({ className, children }: { className: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!openRewardsQueue()) router.push("/conquistas");
      }}
    >
      {children}
    </button>
  );
}
