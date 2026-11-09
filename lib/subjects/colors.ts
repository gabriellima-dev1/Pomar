/**
 * Paleta das disciplinas. Mesma lista do `check` de subjects.color
 * (supabase/migrations/*_disciplinas.sql): cor nova exige migração nova.
 * Tons escuros o bastante para contraste AA com texto branco.
 */
export const SUBJECT_COLORS = [
  { key: "tomate", label: "Tomate", hex: "#c0392b" },
  { key: "laranja", label: "Laranja", hex: "#b9510f" },
  { key: "mel", label: "Mel", hex: "#8a6100" },
  { key: "folha", label: "Folha", hex: "#2f6b3f" },
  { key: "menta", label: "Menta", hex: "#0f7466" },
  { key: "ceu", label: "Céu", hex: "#1f5ea8" },
  { key: "uva", label: "Uva", hex: "#6d3fa0" },
  { key: "terra", label: "Terra", hex: "#7a4b32" },
] as const;

export type SubjectColor = (typeof SUBJECT_COLORS)[number]["key"];

const KEYS: ReadonlySet<string> = new Set(SUBJECT_COLORS.map((c) => c.key));

export function isSubjectColor(value: unknown): value is SubjectColor {
  return typeof value === "string" && KEYS.has(value);
}

/** Cor sugerida para a próxima disciplina (rodízio pela quantidade que o usuário já tem). */
export function suggestColor(existingCount: number): SubjectColor {
  const index =
    ((Math.trunc(existingCount) % SUBJECT_COLORS.length) + SUBJECT_COLORS.length) %
    SUBJECT_COLORS.length;
  return SUBJECT_COLORS[index]!.key;
}

export function colorHex(key: string): string {
  return SUBJECT_COLORS.find((c) => c.key === key)?.hex ?? SUBJECT_COLORS[0].hex;
}
