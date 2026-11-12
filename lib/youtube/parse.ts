/**
 * Importação de playlist do YouTube (DESIGN §4.1, telas.md › 30): leitura do link,
 * durações ISO 8601 e o resumo do rodapé. Funções puras.
 */
import { pomodorosFor } from "@/lib/estimates";

export const VIDEO_SPEEDS = [1, 1.25, 1.5, 2] as const;
export type VideoSpeed = (typeof VIDEO_SPEEDS)[number];
export const MAX_VIDEOS = 200;

const ID = /^[A-Za-z0-9_-]{10,64}$/;

export function isVideoSpeed(v: number): v is VideoSpeed {
  return (VIDEO_SPEEDS as readonly number[]).includes(v);
}

/**
 * Id da playlist a partir de um link de playlist ou de vídeo com `list=`
 * (youtube.com, m., music., youtu.be) ou do próprio id. null = link inválido.
 */
export function parsePlaylistId(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  if (ID.test(text) && !text.includes(".")) return text;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (!["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host)) {
    return null;
  }
  const list = url.searchParams.get("list");
  return list && ID.test(list) ? list : null;
}

/** "PT1H2M3S" → 3723; "P1DT1M" → 86460; inválido ou ao vivo ("P0D") → 0. */
export function parseIsoDuration(iso: string): number {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso ?? "");
  if (!m) return 0;
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  return (d ?? 0) * 86_400 + (h ?? 0) * 3600 + (min ?? 0) * 60 + (s ?? 0);
}

/** "22 min", "1h 05min" para a lista; arredonda para o minuto (mínimo 1). */
export function videoMinutes(sec: number): string {
  const min = Math.max(1, Math.round(sec / 60));
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}min`;
}

/** "9h 40min", "45min". */
export function totalLabel(sec: number): string {
  const min = Math.round(sec / 60);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

/** "1,25×". */
export function speedLabel(speed: number): string {
  return `${speed.toLocaleString("pt-BR")}×`;
}

/**
 * Rodapé (30): "18 vídeos · 7h 10min" + "≈ 5h 44min em 1,25× · cerca de 14 pomodoros".
 * Os pomodoros somam por vídeo (cada vídeo é um tópico).
 */
export function importSummary(
  durations: readonly number[],
  speed: number,
  focusMin: number,
): { count: number; totalSec: number; line1: string; line2: string } {
  const totalSec = durations.reduce((a, b) => a + b, 0);
  const pomodoros = durations.reduce((a, d) => a + pomodorosFor(d / 60 / speed, focusMin), 0);
  const count = durations.length;
  return {
    count,
    totalSec,
    line1: `${count} ${count === 1 ? "vídeo" : "vídeos"} · ${totalLabel(totalSec)}`,
    line2: `≈ ${totalLabel(totalSec / speed)} em ${speedLabel(speed)} · cerca de ${pomodoros} ${pomodoros === 1 ? "pomodoro" : "pomodoros"}`,
  };
}
