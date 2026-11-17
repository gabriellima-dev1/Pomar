/**
 * Avisos de fim de fase: som curto (Web Audio, sem arquivo), notificação do navegador
 * (só com permissão) e título da aba piscando quando não há notificação (PLANO §7).
 */
import { track } from "@/lib/telemetry";

let audio: AudioContext | null = null;

/** Prepara o áudio num toque do usuário (os navegadores bloqueiam som sem interação). */
export function unlockAudio(): void {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}

/** Duas notas suaves (sol → dó). */
export function playChime(): void {
  try {
    audio ??= new AudioContext();
    const ctx = audio;
    const t = ctx.currentTime;
    [784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t + i * 0.22;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  } catch {
    // Sem áudio: segue sem som.
  }
}

const ALERTED_KEY = "pomar:aviso-tocado";

/**
 * O aviso de fim do foco toca uma vez por ciclo, seja no Foco ou pelo item Foco do menu
 * (telas.md › 39b). Devolve `true` só na primeira chamada para essa sessão.
 */
export function claimCycleAlert(sessionId: string): boolean {
  try {
    if (window.sessionStorage.getItem(ALERTED_KEY) === sessionId) return false;
    window.sessionStorage.setItem(ALERTED_KEY, sessionId);
  } catch {
    // Sem sessionStorage: no pior caso, o aviso toca de novo ao abrir o Foco.
  }
  return true;
}

export type NotificationType = "cycle_end" | "break_end";

export function canNotify(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

/** Notifica só com a aba oculta: com ela visível, o próprio app mostra o fim do ciclo. */
export function notify(type: NotificationType, title: string, body: string): boolean {
  if (!canNotify() || !cycleAlertsEnabled() || document.visibilityState === "visible") return false;
  try {
    const n = new Notification(title, { body, tag: `pomar-${type}`, icon: "/favicon.ico" });
    void track("notification_shown", { type });
    n.onclick = () => {
      void track("notification_clicked", { type });
      window.focus();
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

/** Pisca o título da aba até ela voltar a ficar visível. Devolve a função que para. */
export function blinkTitle(message: string): () => void {
  const original = document.title;
  let on = false;
  const id = window.setInterval(() => {
    on = !on;
    document.title = on ? message : original;
  }, 1000);
  const stop = () => {
    window.clearInterval(id);
    document.title = original;
    document.removeEventListener("visibilitychange", onVisible);
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") stop();
  };
  document.addEventListener("visibilitychange", onVisible);
  return stop;
}

// Preferências locais (por aparelho) -------------------------------------------------

const SOUND_KEY = "pomar:som";
const NOTIF_KEY = "pomar:notificacao-perguntada";
const ALERTS_KEY = "pomar:aviso-fim";
/** Evento disparado nesta aba quando uma preferência muda (o `storage` só vem das outras). */
const PREFS_EVENT = "pomar:preferencias";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Armazenamento bloqueado: a preferência vale só nesta visita.
  }
  window.dispatchEvent(new Event(PREFS_EVENT));
}

/** Para `useSyncExternalStore`: avisa quando som, aviso ou permissão mudam. */
export function subscribePrefs(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREFS_EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREFS_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

export function soundEnabled(): boolean {
  return read(SOUND_KEY) !== "nao";
}

export function setSoundEnabled(on: boolean): void {
  write(SOUND_KEY, on ? "sim" : "nao");
}

/** Mostrar o convite para avisar no fim do ciclo? */
export function shouldAskNotification(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "default" &&
    read(NOTIF_KEY) === null
  );
}

export function markNotificationAsked(): void {
  write(NOTIF_KEY, "1");
}

/**
 * "Aviso de fim do ciclo" (Configurações, telas.md › 31): ligado por padrão, mas só
 * aparece com a permissão do navegador. Desligar aqui cala o aviso mesmo com permissão.
 */
export function cycleAlertsEnabled(): boolean {
  return read(ALERTS_KEY) !== "nao";
}

export function setCycleAlertsEnabled(on: boolean): void {
  write(ALERTS_KEY, on ? "sim" : "nao");
}

export type NotificationState = "sem-suporte" | "pedir" | "permitido" | "bloqueado";

/** Estado da permissão de notificação do navegador. */
export function notificationState(): NotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) return "sem-suporte";
  const p = Notification.permission;
  return p === "granted" ? "permitido" : p === "denied" ? "bloqueado" : "pedir";
}
