/**
 * Emblemas diários ("frutos do dia", DESIGN.md §6.4). Mesmos códigos, raridades e
 * pesos da tabela `badges` (migração da gamificação). Os textos ficam aqui para não
 * expor pela API a regra dos emblemas ocultos.
 */

export type Rarity = "comum" | "incomum" | "raro";

export const RARITY_WEIGHT: Record<Rarity, number> = { comum: 10, incomum: 5, raro: 1 };

export const RARITY_LABEL: Record<Rarity, string> = {
  comum: "Comum",
  incomum: "Incomum",
  raro: "Raro",
};

export const BADGE_CODES = [
  "fruto_do_dia",
  "madrugador",
  "coruja",
  "maratona",
  "sem_pausa",
  "explorador",
  "finalizador",
  "constante",
  "retorno",
  "fruto_dourado",
  "lua_cheia",
] as const;

export type BadgeCode = (typeof BADGE_CODES)[number];

export type BadgeInfo = {
  code: BadgeCode;
  name: string;
  rarity: Rarity;
  hidden: boolean;
  /** Regra de elegibilidade, mostrada na folha do álbum (nunca para oculto não obtido). */
  rule: string;
  /** Motivo, na revelação ("Você fez 3 pomodoros sem nenhuma pausa."). */
  reason: string;
};

export const BADGES: readonly BadgeInfo[] = [
  {
    code: "fruto_do_dia",
    name: "Fruto do Dia",
    rarity: "comum",
    hidden: false,
    rule: "Sai em qualquer dia com pelo menos um pomodoro concluído.",
    reason: "Você colheu pelo menos um fruto nesse dia.",
  },
  {
    code: "madrugador",
    name: "Madrugador",
    rarity: "comum",
    hidden: false,
    rule: "Começar um pomodoro antes das 7h.",
    reason: "Você começou um pomodoro antes das 7h.",
  },
  {
    code: "coruja",
    name: "Coruja",
    rarity: "comum",
    hidden: false,
    rule: "Começar um pomodoro depois das 22h.",
    reason: "Você começou um pomodoro depois das 22h.",
  },
  {
    code: "maratona",
    name: "Maratona",
    rarity: "incomum",
    hidden: false,
    rule: "Fazer 4 pomodoros seguidos no dia, sem encerrar nenhum no meio.",
    reason: "Você fez 4 pomodoros seguidos sem encerrar nenhum.",
  },
  {
    code: "sem_pausa",
    name: "Foco de Ferro",
    rarity: "incomum",
    hidden: false,
    rule: "Fazer 3 ou mais pomodoros no dia sem nenhuma pausa.",
    reason: "Você fez 3 pomodoros sem nenhuma pausa.",
  },
  {
    code: "explorador",
    name: "Explorador",
    rarity: "incomum",
    hidden: false,
    rule: "Concluir o primeiro pomodoro de um capítulo ou de uma disciplina nova.",
    reason: "Você começou um capítulo ou uma disciplina nova.",
  },
  {
    code: "finalizador",
    name: "Finalizador",
    rarity: "incomum",
    hidden: false,
    rule: "Concluir um capítulo (marcar o último tópico dele).",
    reason: "Você concluiu um capítulo.",
  },
  {
    code: "constante",
    name: "Constante",
    rarity: "comum",
    hidden: false,
    rule: "Cumprir a meta diária de pomodoros de uma disciplina.",
    reason: "Você cumpriu a meta diária de uma disciplina.",
  },
  {
    code: "retorno",
    name: "Bom Retorno",
    rarity: "incomum",
    hidden: false,
    rule: "Voltar a estudar depois de 3 dias ou mais sem pomodoro.",
    reason: "Você voltou a estudar depois de uns dias de descanso.",
  },
  {
    code: "fruto_dourado",
    name: "Fruto Dourado",
    rarity: "raro",
    hidden: true,
    rule: "Pode sair em qualquer dia com pomodoro, mas é bem raro (cerca de 1 a cada 50 dias).",
    reason: "Um fruto raro, que só aparece de vez em quando.",
  },
  {
    code: "lua_cheia",
    name: "Lua Cheia",
    rarity: "raro",
    hidden: true,
    rule: "Estudar à noite (entre 18h e 6h) perto da lua cheia.",
    reason: "Você estudou numa noite de lua cheia.",
  },
];

const BY_CODE = new Map(BADGES.map((b) => [b.code, b]));

export function badgeInfo(code: string): BadgeInfo | undefined {
  return BY_CODE.get(code as BadgeCode);
}

export function isBadgeCode(value: string): value is BadgeCode {
  return BY_CODE.has(value as BadgeCode);
}
