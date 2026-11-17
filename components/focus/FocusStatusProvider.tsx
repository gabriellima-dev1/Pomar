"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getRunningFocus, type SessionRow } from "@/app/(app)/pomodoro/actions";
import {
  blinkTitle,
  claimCycleAlert,
  notify,
  playChime,
  soundEnabled,
} from "@/components/pomodoro/alerts";
import {
  focusEndsAt,
  focusStatus,
  sessionFromRow,
  type FocusSession,
  type FocusStatus,
} from "@/lib/focus-status";

type FocusContextValue = {
  status: FocusStatus;
  /** O Foco avisa cada mudança do ciclo (começar, pausar, retomar, encerrar, concluir). */
  publish: (session: FocusSession | null) => void;
};

const FocusContext = createContext<FocusContextValue>({
  status: { kind: "idle" },
  publish: () => {},
});

/** Estado do item Foco do menu. */
export function useFocusStatus(): FocusStatus {
  return useContext(FocusContext).status;
}

/** Para o Foco publicar as mudanças do ciclo (fora do provider não faz nada). */
export function useFocusPublisher(): (session: FocusSession | null) => void {
  return useContext(FocusContext).publish;
}

/** Mais de 1 min depois do fim: a pessoa não estava aqui; nada de som (como no Foco). */
const LATE_MS = 60_000;

function rowKey(row: SessionRow | null): string {
  return row ? `${row.id}:${row.paused_at ?? ""}:${row.paused_sec}` : "";
}

/**
 * Sessão de foco do item Foco em todas as telas (telas.md › Foco no menu, 39 e 39b).
 * Começa com a sessão lida no servidor pelo layout; o Foco publica cada mudança; ao
 * voltar para a aba, relê o servidor (outro aparelho). O relógio anda 1×/s só com a aba
 * visível e o foco rodando. Se o foco acaba fora do Foco, o aviso que a pessoa pediu
 * toca uma vez e o item mostra "Colher".
 */
export function FocusStatusProvider({
  initial,
  renderedAt,
  children,
}: {
  initial: SessionRow | null;
  /** Hora da renderização no servidor: o 1º quadro é igual no servidor e no navegador. */
  renderedAt: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const inFocus = pathname.startsWith("/pomodoro");
  const inFocusRef = useRef(inFocus);
  useEffect(() => {
    inFocusRef.current = inFocus;
  }, [inFocus]);

  const [session, setSession] = useState<FocusSession | null>(() =>
    initial ? sessionFromRow(initial) : null,
  );
  // O layout renderizou de novo (router.refresh, revalidação): o servidor manda.
  const key = rowKey(initial);
  const [seenKey, setSeenKey] = useState(key);
  if (seenKey !== key) {
    setSeenKey(key);
    setSession(initial ? sessionFromRow(initial) : null);
  }

  const [now, setNow] = useState(renderedAt);
  const endsAt = session ? focusEndsAt(session) : null;

  // Relógio: 1×/s enquanto o foco roda e a aba está visível; para no fim do ciclo.
  useEffect(() => {
    let id: number | undefined;
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (endsAt === null || n >= endsAt) stop();
    };
    const run = () => {
      tick();
      if (endsAt !== null && id === undefined && Date.now() < endsAt) {
        id = window.setInterval(tick, 1000);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
      else stop();
    };
    const first = window.setTimeout(onVisibility, 0);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(first);
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endsAt]);

  // Outro aparelho pode ter começado, pausado ou encerrado: relê ao voltar para a aba.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible" || inFocusRef.current) return;
      getRunningFocus()
        .then((row) => {
          if (!inFocusRef.current) setSession(row ? sessionFromRow(row) : null);
        })
        .catch(() => {
          // Sem rede: fica o que já se sabia.
        });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Fim do foco fora do Foco: o aviso pedido toca uma vez (no Foco, quem avisa é ele).
  const sessionId = session?.id ?? null;
  useEffect(() => {
    if (!sessionId || endsAt === null || inFocus) return;
    const fire = () => {
      if (Date.now() - endsAt >= LATE_MS || !claimCycleAlert(sessionId)) return;
      if (soundEnabled()) playChime();
      const shown = notify(
        "cycle_end",
        "Fruto pronto para colher",
        "Seu foco terminou. Abra o Foco para colher o fruto.",
      );
      if (!shown && document.visibilityState === "hidden") blinkTitle("🍅 Fruto pronto!");
    };
    const id = window.setTimeout(fire, Math.max(0, endsAt - Date.now()));
    return () => window.clearTimeout(id);
  }, [sessionId, endsAt, inFocus]);

  const value = { status: focusStatus(session, now), publish: setSession };
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}
