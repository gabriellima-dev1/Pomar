/** Divisões da Feira (DESIGN §6.6): Bronze → Prata → Ouro → Esmeralda. */
export const DIVISION_CODES = ["bronze", "prata", "ouro", "esmeralda"] as const;

export type Division = (typeof DIVISION_CODES)[number];

export const DIVISION_LABEL: Record<Division, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  esmeralda: "Esmeralda",
};

export function isDivision(value: unknown): value is Division {
  return typeof value === "string" && (DIVISION_CODES as readonly string[]).includes(value);
}

/** Divisão seguinte (null na Esmeralda). */
export function nextDivision(d: Division): Division | null {
  return DIVISION_CODES[DIVISION_CODES.indexOf(d) + 1] ?? null;
}

/** Divisão anterior (null no Bronze). */
export function previousDivision(d: Division): Division | null {
  const i = DIVISION_CODES.indexOf(d);
  return i > 0 ? DIVISION_CODES[i - 1]! : null;
}
