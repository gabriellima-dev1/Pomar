import type { ThemeConfig } from "./types";

export const natal: ThemeConfig = {
  code: "natal",
  name: "Natal",
  unlockRule: "Ganhe na 1ª Colheita de Ouro (7 dias numa semana)",
  unlockedPhrase:
    "Sua primeira Colheita de Ouro trouxe neve, um pinheiro enfeitado e uma estrela para o pomar.",
  fruit: "enfeite",
  accessory: "gorro",
  seasonMonth: 12,
  // Cronômetro na estrela, pinheiro no centro.
  layout: { treeX: 195, treeBaseY: 574, treeScale: 1, timer: "star", mirror: false },
};
