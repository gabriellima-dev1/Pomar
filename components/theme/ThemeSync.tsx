"use client";

import { useLayoutEffect } from "react";
import type { ThemeCode } from "@/lib/gamification/themes";

/**
 * Mantém `data-theme` no `<html>` com o tema escolhido (null = automático: sem
 * atributo, e o tokens.css usa o Noturno no modo escuro). Ao sair da área logada
 * (páginas públicas), o atributo é removido.
 */
export function ThemeSync({ theme }: { theme: ThemeCode | null }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
    return () => root.removeAttribute("data-theme");
  }, [theme]);
  return null;
}
