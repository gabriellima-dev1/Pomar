/**
 * Fluxo do onboarding (telas.md › Fase 4 › Fluxo do onboarding):
 * boas-vindas → quiz → perfil → Feira → nova disciplina → calibração → 1º pomodoro →
 * primeiro fruto → Início. O passo fica salvo em `profiles.onboarding_step`.
 */

export const ONBOARDING_STEPS = [
  "boas_vindas",
  "quiz",
  "perfil",
  "feira",
  "disciplina",
  "calibracao",
  "pomodoro",
  "primeiro_fruto",
  "concluido",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return typeof value === "string" && (ONBOARDING_STEPS as readonly string[]).includes(value);
}

/** Lê a coluna do perfil; valor desconhecido conta como concluído (não prende ninguém). */
export function parseStep(value: unknown): OnboardingStep {
  return isOnboardingStep(value) ? value : "concluido";
}

const RANK = new Map(ONBOARDING_STEPS.map((s, i) => [s, i]));

function rank(step: OnboardingStep): number {
  return RANK.get(step) ?? ONBOARDING_STEPS.length;
}

/** O onboarding só anda para a frente: ir para `to` é válido se vier depois de `from`. */
export function canAdvance(from: OnboardingStep, to: OnboardingStep): boolean {
  return rank(to) > rank(from);
}

export function isOnboarding(step: OnboardingStep): boolean {
  return step !== "concluido";
}

/** Os 5 passos mostrados na tela 16 (e o "Passo N de 5" das telas seguintes). */
export const VISIBLE_STEPS = [
  "Conhecer o seu jeito de estudar",
  "Decidir se quer entrar na Feira",
  "Criar sua primeira disciplina",
  "Medir seu ritmo de leitura",
  "Colher o primeiro fruto",
] as const;

/** Número do passo visível (1–5) de cada etapa; 0 nas boas-vindas e no fim. */
export function visibleStep(step: OnboardingStep): number {
  switch (step) {
    case "quiz":
    case "perfil":
      return 1;
    case "feira":
      return 2;
    case "disciplina":
      return 3;
    case "calibracao":
      return 4;
    case "pomodoro":
    case "primeiro_fruto":
      return 5;
    default:
      return 0;
  }
}

/**
 * Rota de cada passo. `subjectId` é a disciplina criada no passo 3 (calibração e 1º
 * pomodoro); sem ela, a calibração e o pomodoro voltam para a criação da disciplina.
 */
export function pathForStep(step: OnboardingStep, subjectId: string | null): string {
  switch (step) {
    case "boas_vindas":
      return "/onboarding";
    case "quiz":
      return "/onboarding/quiz";
    case "perfil":
      return "/onboarding/perfil";
    case "feira":
      return "/onboarding/feira";
    case "disciplina":
      return "/disciplinas/nova";
    case "calibracao":
      return subjectId ? `/disciplinas/${subjectId}/calibrar` : "/disciplinas/nova";
    case "pomodoro":
      return subjectId ? `/pomodoro?disciplina=${subjectId}` : "/disciplinas/nova";
    case "primeiro_fruto":
      return "/onboarding/primeiro-fruto";
    case "concluido":
      return "/inicio";
  }
}

/**
 * Passo seguinte à criação da 1ª disciplina: o catálogo já tem a calibração (que pode
 * ser pulada) dentro do mesmo fluxo; a manual vai para a calibração.
 */
export function stepAfterSubject(source: "catalog" | "manual"): OnboardingStep {
  return source === "catalog" ? "pomodoro" : "calibracao";
}
