/**
 * Perfis de Bartle (DESIGN.md §6.8): quiz de 8 perguntas, 4 alternativas cada (uma por
 * perfil). Resultado = perfil com mais respostas + distribuição percentual. O texto das
 * perguntas e as regras vêm de docs/design/quiz-bartle.json (fonte única).
 */

import quiz from "@/docs/design/quiz-bartle.json";

export const PROFILES = ["conquistador", "competidor", "explorador", "socializador"] as const;
export type BartleProfile = (typeof PROFILES)[number];

export const PROFILE_LABEL: Record<BartleProfile, string> = {
  conquistador: "Conquistador",
  competidor: "Competidor",
  explorador: "Explorador",
  socializador: "Socializador",
};

/** Trecho de texto; `strong` sai em negrito (tela 18). */
export type Segment = { text: string; strong?: boolean };

/** "Por isso destacamos …" de cada perfil (DESIGN §6.8, tela 18). */
export const PROFILE_HIGHLIGHT: Record<BartleProfile, Segment[]> = {
  conquistador: [
    { text: "Você gosta de ver o progresso. Por isso destacamos sua " },
    { text: "barra de XP", strong: true },
    { text: ", o " },
    { text: "próximo nível", strong: true },
    { text: ", a " },
    { text: "colheita da semana", strong: true },
    { text: " e suas " },
    { text: "metas", strong: true },
    { text: "." },
  ],
  competidor: [
    { text: "Você gosta de um bom desafio. Por isso destacamos sua " },
    { text: "posição na Feira", strong: true },
    { text: ", quanto falta para o " },
    { text: "próximo colocado", strong: true },
    { text: " e a " },
    { text: "subida de divisão", strong: true },
    { text: "." },
  ],
  explorador: [
    { text: "Você gosta de descobrir coisas. Por isso destacamos o " },
    { text: "álbum de emblemas", strong: true },
    { text: " (inclusive os secretos), suas " },
    { text: "estatísticas", strong: true },
    { text: " e os " },
    { text: "temas", strong: true },
    { text: "." },
  ],
  socializador: [
    { text: "Você gosta de estudar junto. Por isso destacamos as " },
    { text: "conquistas de quem você segue", strong: true },
    { text: ", os " },
    { text: "parabéns", strong: true },
    { text: " que você recebe e " },
    { text: "sugestões de quem seguir", strong: true },
    { text: "." },
  ],
};

/** Resumo curto do destaque, para a lista "Escolher outro perfil". */
export const PROFILE_SUMMARY: Record<BartleProfile, string> = {
  conquistador: "XP, próximo nível, colheita e metas",
  competidor: "Posição na Feira e subida de divisão",
  explorador: "Álbum de emblemas, estatísticas e temas",
  socializador: "Quem você segue e parabéns recebidos",
};

export type Question = {
  id: number;
  text: string;
  options: Record<BartleProfile, string>;
};

export const QUESTIONS: readonly Question[] = quiz.perguntas.map((q) => ({
  id: q.id,
  text: q.texto,
  options: q.alternativas,
}));

export const QUESTION_COUNT = QUESTIONS.length;

export type Answers = (BartleProfile | null)[];

export function isBartleProfile(value: unknown): value is BartleProfile {
  return typeof value === "string" && (PROFILES as readonly string[]).includes(value);
}

/** Lê as respostas guardadas no perfil (jsonb), descartando o que não for válido. */
export function parseAnswers(value: unknown): Answers {
  const list = Array.isArray(value) ? value.slice(0, QUESTION_COUNT) : [];
  return Array.from({ length: QUESTION_COUNT }, (_, i) =>
    isBartleProfile(list[i]) ? list[i] : null,
  );
}

/** Índice da primeira pergunta sem resposta (ou `QUESTION_COUNT` se todas têm). */
export function firstUnanswered(answers: Answers): number {
  const i = answers.findIndex((a) => a === null);
  return i === -1 ? QUESTION_COUNT : i;
}

export type Scores = Record<BartleProfile, number>;

/**
 * Percentuais que somam 100 pelo método do maior resto. Empate no resto: vence a
 * ordem de `PROFILES` (determinístico).
 */
export function percentages(counts: Record<BartleProfile, number>): Scores {
  const total = PROFILES.reduce((n, p) => n + counts[p], 0);
  const result = { conquistador: 0, competidor: 0, explorador: 0, socializador: 0 };
  if (total === 0) return result;
  const exact = PROFILES.map((p) => ({ p, value: (counts[p] * 100) / total }));
  for (const { p, value } of exact) result[p] = Math.floor(value);
  let left = 100 - PROFILES.reduce((n, p) => n + result[p], 0);
  const byRemainder = [...exact].sort(
    (a, b) => b.value - Math.floor(b.value) - (a.value - Math.floor(a.value)),
  );
  for (const { p } of byRemainder) {
    if (left <= 0) break;
    result[p] += 1;
    left -= 1;
  }
  return result;
}

export type QuizResult = { primary: BartleProfile; scores: Scores };

/**
 * Resultado do quiz (quiz-bartle.json › regras): perfil com mais respostas; empate
 * vence o perfil escolhido por último entre os empatados. `null` sem nenhuma resposta.
 */
export function scoreAnswers(answers: Answers): QuizResult | null {
  const counts = { conquistador: 0, competidor: 0, explorador: 0, socializador: 0 };
  const lastIndex = { conquistador: -1, competidor: -1, explorador: -1, socializador: -1 };
  answers.forEach((a, i) => {
    if (!a) return;
    counts[a] += 1;
    lastIndex[a] = i;
  });
  const best = Math.max(...PROFILES.map((p) => counts[p]));
  if (best === 0) return null;
  const tied = PROFILES.filter((p) => counts[p] === best);
  const primary = tied.reduce((a, b) => (lastIndex[b] > lastIndex[a] ? b : a));
  return { primary, scores: percentages(counts) };
}

/** Lê `bartle_scores` (jsonb) do perfil. */
export function parseScores(value: unknown): Scores | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const out = { conquistador: 0, competidor: 0, explorador: 0, socializador: 0 };
  for (const p of PROFILES) {
    const n = v[p];
    if (typeof n !== "number" || !Number.isFinite(n)) return null;
    out[p] = n;
  }
  return out;
}

/** Perfis do maior para o menor percentual (tela 18 › "Suas respostas"). */
export function rankedScores(scores: Scores, primary: BartleProfile): [BartleProfile, number][] {
  return [...PROFILES]
    .sort((a, b) => {
      if (a === primary) return -1;
      if (b === primary) return 1;
      return scores[b] - scores[a];
    })
    .map((p) => [p, scores[p]]);
}

// Embaralhamento estável ---------------------------------------------------------

function hash(text: string): number {
  // FNV-1a de 32 bits.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ordem das alternativas de uma pergunta, embaralhada (quiz-bartle.json › regras) mas
 * estável para a mesma pessoa: voltar a uma pergunta não muda a ordem.
 */
export function optionOrder(questionId: number, seed: string): BartleProfile[] {
  const rand = mulberry32(hash(`${seed}:${questionId}`));
  const order = [...PROFILES];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j] as BartleProfile, order[i] as BartleProfile];
  }
  return order;
}
