"use client";

import { useSyncExternalStore } from "react";
import { effectiveTheme, type ThemeCode, type ThemePreference } from "@/lib/gamification/themes";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** O sistema está no modo escuro (atualiza quando muda). */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Tema que está valendo: o escolhido, ou no automático o Noturno com o aparelho escuro. */
export function useEffectiveTheme(chosen: ThemePreference): ThemeCode {
  return effectiveTheme(chosen, usePrefersDark());
}
