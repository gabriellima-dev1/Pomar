import type { ThemeConfig } from "./types";

export const noturno: ThemeConfig = {
  code: "noturno",
  name: "Noturno",
  unlockRule: null,
  unlockedPhrase: null,
  fruit: "tomate",
  accessory: "pijama",
  seasonMonth: null,
  // Cronômetro dentro da lua, árvore à esquerda (paisagem espelhada).
  layout: { treeX: 296, treeBaseY: 572, treeScale: 2.1, timer: "moon", mirror: true },
};
