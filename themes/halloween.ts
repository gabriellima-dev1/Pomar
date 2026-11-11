import type { ThemeConfig } from "./types";

export const halloween: ThemeConfig = {
  code: "halloween",
  name: "Halloween",
  unlockRule: "Ganhe na 1ª Colheita de Prata (5 dias numa semana)",
  unlockedPhrase:
    "Sua primeira Colheita de Prata trouxe abóboras para o pomar e uma lua cheia para o cronômetro.",
  fruit: "abobora",
  accessory: "abobora",
  seasonMonth: 10,
  layout: { treeX: 300, treeBaseY: 574, treeScale: 2.1 },
};
