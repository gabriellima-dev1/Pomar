"use client";

import { useEffect } from "react";
import { markReactionsSeen } from "@/app/(app)/liga/actions";

/** Fruto do pomar (desenho do disco da faixa na referência 26). */
function FruitDisc() {
  return (
    <span aria-hidden className="bg-fruit grid size-14 shrink-0 place-items-center rounded-full">
      <svg viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="14" r="7" fill="var(--on-fruit)" />
        <path d="M12 7V4" stroke="var(--on-fruit)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Parabéns recebidos desde a última visita (faixa `--fruit-soft` da tela 26).
 * Ao aparecer, marca como visto: na próxima visita, só os novos.
 */
export function ReactionBanner({
  lead,
  others,
  prefix,
  name,
}: {
  lead: string;
  others: number;
  prefix: string;
  name: string;
}) {
  useEffect(() => {
    void markReactionsSeen();
  }, []);
  const people =
    others === 0 ? "" : others === 1 ? " e mais 1 pessoa" : ` e mais ${others} pessoas`;
  return (
    <p className="bg-fruit-soft text-ink flex items-center gap-4 rounded-lg px-4 py-4">
      <FruitDisc />
      <span>
        <strong className="font-extrabold">{lead}</strong>
        {people} {others === 0 ? "deu" : "deram"} parabéns {prefix}{" "}
        <strong className="font-extrabold">{name}</strong>.
      </span>
    </p>
  );
}
