/**
 * Contas demo da apresentação (PLANO Fase 6: "Seed de usuários demo (com selo) para
 * popular ligas"). Só o plano é puro aqui: quem são as pessoas e em que dias e horários
 * cada uma estudou. O script `npm run demo:seed` cria as contas e grava os ciclos; os
 * emblemas, colheitas, ofensiva e XP saem das mesmas funções do servidor.
 */
import type { BartleProfile } from "@/lib/bartle";
import { zonedMidnight } from "@/lib/dates";

export type DemoPersona = {
  username: string;
  name: string;
  bartle: BartleProfile;
  theme: "classico" | "noturno";
  isPublic: boolean;
  /** Chance de estudar num dia (0–1). */
  activity: number;
  /** Máximo de pomodoros num dia de estudo. */
  perDay: number;
};

export const DEMO_TZ = "America/Maceio";

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    username: "bia.estudos",
    name: "Bia",
    bartle: "conquistador",
    theme: "classico",
    isPublic: true,
    activity: 0.9,
    perDay: 5,
  },
  {
    username: "joao_calc",
    name: "João",
    bartle: "competidor",
    theme: "noturno",
    isPublic: true,
    activity: 0.85,
    perDay: 4,
  },
  {
    username: "mari.lima",
    name: "Mari",
    bartle: "socializador",
    theme: "classico",
    isPublic: true,
    activity: 0.8,
    perDay: 3,
  },
  {
    username: "pedro.alg",
    name: "Pedro",
    bartle: "explorador",
    theme: "classico",
    isPublic: true,
    activity: 0.7,
    perDay: 4,
  },
  {
    username: "lari_bio",
    name: "Lari",
    bartle: "conquistador",
    theme: "noturno",
    isPublic: true,
    activity: 0.65,
    perDay: 3,
  },
  {
    username: "theo.fis",
    name: "Théo",
    bartle: "competidor",
    theme: "classico",
    isPublic: false,
    activity: 0.6,
    perDay: 3,
  },
  {
    username: "clara.dev",
    name: "Clara",
    bartle: "explorador",
    theme: "classico",
    isPublic: true,
    activity: 0.55,
    perDay: 2,
  },
  {
    username: "gui_mat",
    name: "Gui",
    bartle: "socializador",
    theme: "noturno",
    isPublic: true,
    activity: 0.5,
    perDay: 3,
  },
  {
    username: "nanda.cs",
    name: "Nanda",
    bartle: "conquistador",
    theme: "classico",
    isPublic: false,
    activity: 0.4,
    perDay: 2,
  },
  {
    username: "rafa_ufal",
    name: "Rafa",
    bartle: "competidor",
    theme: "classico",
    isPublic: true,
    activity: 0.35,
    perDay: 2,
  },
  {
    username: "isa.prog",
    name: "Isa",
    bartle: "explorador",
    theme: "noturno",
    isPublic: true,
    activity: 0.3,
    perDay: 2,
  },
  {
    username: "davi.est",
    name: "Davi",
    bartle: "socializador",
    theme: "classico",
    isPublic: false,
    activity: 0.2,
    perDay: 1,
  },
];

export const demoEmail = (username: string) => `demo.${username}@example.com`;
export const DEMO_EMAIL_RE = /^demo\.[a-z0-9._]+@example\.com$/;

/** Pseudoaleatório determinístico a partir de um texto (mulberry32 sobre um hash). */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PlannedSession = { startedAt: string; endedAt: string };

const FOCUS_MS = 25 * 60_000;
const SLOT_MS = 30 * 60_000;

/**
 * Ciclos de 25 min de uma pessoa nos `days` que ainda não têm ciclo (`skip`), entre 8h e
 * 21h locais, um atrás do outro com 5 min de descanso. Nada termina depois de `now`.
 * Rodar de novo com os mesmos dias não muda o plano (semente = apelido + dia).
 */
export function plannedSessions(
  persona: DemoPersona,
  days: string[],
  skip: ReadonlySet<string>,
  now: Date,
): PlannedSession[] {
  const out: PlannedSession[] = [];
  for (const day of days) {
    if (skip.has(day)) continue;
    const rnd = seededRandom(`${persona.username}:${day}`);
    if (rnd() >= persona.activity) continue;
    const count = 1 + Math.floor(rnd() * persona.perDay);
    const startMinute = (8 + Math.floor(rnd() * 13)) * 60 + Math.floor(rnd() * 4) * 15;
    const first = zonedMidnight(day, DEMO_TZ).getTime() + startMinute * 60_000;
    for (let i = 0; i < count; i++) {
      const start = first + i * SLOT_MS;
      const end = start + FOCUS_MS;
      if (end > now.getTime()) break;
      out.push({ startedAt: new Date(start).toISOString(), endedAt: new Date(end).toISOString() });
    }
  }
  return out;
}
