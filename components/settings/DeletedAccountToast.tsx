"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Toast } from "@/components/ui/Toast";

const subscribe = () => () => {};
const fromUrl = () => new URLSearchParams(window.location.search).get("conta") === "excluida";

/**
 * Depois de excluir a conta (tela 32), a landing mostra "Sua conta foi excluída".
 * A landing é estática (cache curto), então o aviso lê a URL só no navegador.
 */
export function DeletedAccountToast() {
  const flagged = useSyncExternalStore(subscribe, fromUrl, () => false);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => {
    setDone(true);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  return <Toast open={flagged && !done} onDone={onDone} title="Sua conta foi excluída" />;
}
