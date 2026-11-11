import type { ThemeCode } from "@/lib/gamification/themes";

/**
 * Tema = tokens CSS (`[data-theme]` em app/tokens.css) + cena + preset de layout +
 * fruto + acessório do Seu Tomás (DESIGN.md §6.7). As regras de desbloqueio ficam em
 * lib/gamification/themes.ts e harvest.ts; aqui só o que muda na tela.
 */
export type ThemeConfig = {
  code: ThemeCode;
  name: string;
  /** Regra no card bloqueado (tela 11); null = livre. */
  unlockRule: string | null;
  /** Frase da tela "Tema desbloqueado" (14). */
  unlockedPhrase: string | null;
  /** Fruto que amadurece na cena. */
  fruit: "tomate" | "abobora" | "enfeite";
  /** Acessório do Seu Tomás (docs/design/ilustracoes/seu-tomas-{tema}.svg). */
  accessory: "basico" | "pijama" | "abobora" | "gorro";
  /** Mês em que o tema é sugerido (Kairos). */
  seasonMonth: number | null;
  /**
   * Preset de layout (DESIGN §6.7, decisão da dupla 11/11): onde fica a árvore e em que
   * o cronômetro "mora". `timer` = astro desenhado atrás do painel de vidro (lua ou
   * estrela); `mirror` espelha a paisagem (árvore à esquerda). Coordenadas do viewBox
   * 390×844 da cena.
   */
  layout: {
    treeX: number;
    treeBaseY: number;
    treeScale: number;
    timer: "plain" | "moon" | "star";
    mirror: boolean;
  };
};
