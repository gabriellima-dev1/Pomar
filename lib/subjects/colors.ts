/**
 * Paleta das disciplinas. Mesma lista do `check` de subjects.color
 * (supabase/migrations/*_disciplinas.sql): cor nova exige migração nova.
 * Os tons vêm dos tokens `--subject-*` (docs/design/tokens.json): escuros nos temas
 * claros e claros nos escuros, sempre com `--on-subject` por cima (AA).
 */
export const SUBJECT_COLORS = [
  { key: "tomate", label: "Tomate" },
  { key: "laranja", label: "Laranja" },
  { key: "mel", label: "Mel" },
  { key: "folha", label: "Folha" },
  { key: "menta", label: "Menta" },
  { key: "ceu", label: "Céu" },
  { key: "uva", label: "Uva" },
  { key: "terra", label: "Terra" },
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

/** Valor CSS da cor da disciplina no tema atual (`var(--subject-…)`). */
export function subjectColorVar(key: string): string {
  return `var(--subject-${isSubjectColor(key) ? key : SUBJECT_COLORS[0].key})`;
}
