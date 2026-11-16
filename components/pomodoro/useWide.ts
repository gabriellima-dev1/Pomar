"use client";

import { useEffect, useState } from "react";

/** A partir de 1024px o pomodoro troca para a cena larga e o painel (telas.md). */
export const WIDE_QUERY = "(min-width: 1024px)";

/**
 * `true` com a tela larga. Só para componentes que rodam no navegador (o pomodoro é
 * carregado com `ssr: false`), então o primeiro valor já é o certo.
 */
export function useWide(): boolean {
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}
