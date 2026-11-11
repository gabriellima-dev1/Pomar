"use client";

import { useLayoutEffect } from "react";
import type { ThemePreference } from "@/lib/gamification/themes";

/**
 * Mantém `data-theme` no `<html>` com a preferência do usuário (`auto` = o tokens.css
 * usa o Noturno com o aparelho no modo escuro). Ao sair da área logada (páginas
 * públicas), o atributo é removido e vale o Clássico.
 */
export function ThemeSync({ theme }: { theme: ThemePreference }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    return () => root.removeAttribute("data-theme");
  }, [theme]);
  return null;
}
