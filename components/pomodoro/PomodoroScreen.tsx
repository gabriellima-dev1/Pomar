"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Maximize, Minimize, SlidersHorizontal } from "lucide-react";
import {
  answerPaceSuggestion,
  cancelPomodoro,
  completePomodoro,
  logPages,
  pausePomodoro,
  resumePomodoro,
  saveCycleSettings,
  startPomodoro,
  type SessionRow,
} from "@/app/(app)/pomodoro/actions";
import { markLevelSeen } from "@/app/(app)/conquistas/actions";
import { LevelUpCelebration } from "@/components/gamification/LevelUpCelebration";
import { Scene } from "@/components/scenes/Scene";
import { WideScene } from "@/components/scenes/WideScene";
import { useEffectiveTheme } from "@/components/theme/useEffectiveTheme";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Toast } from "@/components/ui/Toast";
import { levelForXp, stageChanged, stageForLevel } from "@/lib/gamification/levels";
import type { XpResult } from "@/lib/gamification/service";
import type { ThemePreference } from "@/lib/gamification/themes";
import { shortcutFor } from "@/lib/shortcuts";
import { track } from "@/lib/telemetry";
import { THEMES } from "@/themes";
import {
  breakAfter,
  deserialize,
  elapsedMs,
  finish,
  formatTimer,
  isTimeUp,
  LONG_BREAK_EVERY,
  nextCycles,
  pause,
  readyState,
  remainingSec,
  resume,
  serialize,
  start,
  STORAGE_KEY,
  type TimerContext,
  type TimerState,
} from "@/lib/timer";
import {
  blinkTitle,
  markNotificationAsked,
  notify,
  playChime,
  setSoundEnabled,
  shouldAskNotification,
  soundEnabled,
  unlockAudio,
} from "./alerts";
import { CycleSettingsDialog, type CycleSettings } from "./CycleSettingsDialog";
import { DesktopPanel } from "./DesktopPanel";
import { EndOfCycleDialog, type EndTopic } from "./EndOfCycleDialog";
import { GlassTimer } from "./GlassTimer";
import { PauseDialog } from "./PauseDialog";
import { PomodoroControls } from "./PomodoroControls";
import { useWide } from "./useWide";

export type PomodoroTopic = {
  id: string;
  title: string;
  /** Páginas previstas para este ciclo e o intervalo ("p. 68–74"). */
  predictedPages: number;
  predictedLabel: string | null;
  /** Painel do computador: "p. 120–131 · cerca de 2 pomodoros". */
  detail: string | null;
};

export type PomodoroProps = {
  subject: { id: string; title: string } | null;
  topic: PomodoroTopic | null;
  settings: CycleSettings;
  /** Ritmo usado nas estimativas (min/pág); `null` para vídeo ou sessão livre. */
  pace: number | null;
  /** Dia local do usuário (AAAA-MM-DD). */
  today: string;
  /** Ciclo em andamento no servidor (outro aparelho ou recarregamento). */
  running: SessionRow | null;
  /** Tema escolhido (`auto` = Noturno com o aparelho no modo escuro). */
  theme: ThemePreference;
  /** XP total (a árvore da cena segue o estágio do nível). */
  xp: number;
  /** Coorte B (DESIGN §9.4): sem XP e sem celebração de nível visíveis. */
  rewards: boolean;
};

type DialogName = "none" | "settings" | "pause" | "cancel" | "end";

/** Mais de 1 min depois do fim: a pessoa não estava aqui; nada de som. */
const LATE_MS = 60_000;

function fromSession(row: SessionRow, cyclesDone: number, day: string): TimerState {
  const paused = row.paused_at !== null;
  return {
    v: 1,
    phase: "focus",
    status: paused ? "paused" : "running",
    plannedSec: row.planned_focus_sec,
    startedAt: Date.parse(row.started_at),
    pausedAt: paused ? Date.parse(row.paused_at!) : null,
    pausedMs: row.paused_sec * 1000,
    pauses: row.pauses,
    sessionId: row.id,
    subjectId: row.subject_id,
    topicId: row.topic_id,
    cyclesDone,
    day,
  };
}

function overdueMs(t: TimerState, now: number): number {
  if (t.startedAt === null) return 0;
  return now - (t.startedAt + t.pausedMs + t.plannedSec * 1000);
}

function saveState(t: TimerState | null) {
  try {
    if (t) window.localStorage.setItem(STORAGE_KEY, serialize(t));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem localStorage: o ciclo continua no servidor e é retomado ao começar de novo.
  }
}

function loadState(): TimerState | null {
  try {
    return deserialize(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Estado inicial: localStorage + ciclo em andamento no servidor (só no navegador). */
function initialTimer(props: PomodoroProps, ctx: (cycles: number) => TimerContext): TimerState {
  const { running, today, settings } = props;
  const stored = loadState();
  if (running) {
    return stored && stored.sessionId === running.id
      ? stored
      : fromSession(running, stored ? nextCycles(stored, today) : 0, today);
  }
  if (stored && stored.status !== "ready") return stored;
  return readyState("focus", settings.focus, ctx(stored ? nextCycles(stored, today) : 0));
}

/**
 * Tela do pomodoro. Lê o localStorage na criação do estado, por isso só roda no
 * navegador (carregada por PomodoroLoader com `ssr: false`).
 */
export function PomodoroScreen({
  subject,
  topic,
  settings: initialSettings,
  pace,
  today,
  running,
  theme,
  xp,
  rewards,
}: PomodoroProps) {
  const router = useRouter();
  const sceneTheme = useEffectiveTheme(theme);
  const [xpTotal, setXpTotal] = useState(xp);
  // Subida de nível do ciclo (ou do tópico concluído): mostrada depois da folha 07.
  const pendingLevel = useRef<{ from: number; to: number } | null>(null);
  const [celebration, setCelebration] = useState<{ from: number; to: number } | null>(null);
  const ctx = useCallback(
    (cyclesDone: number): TimerContext => ({
      subjectId: subject?.id ?? null,
      topicId: topic?.id ?? null,
      cyclesDone,
      day: today,
    }),
    [subject, topic, today],
  );
  const [settings, setSettings] = useState(initialSettings);
  const [timer, setTimer] = useState<TimerState>(() =>
    initialTimer(
      { subject, topic, settings: initialSettings, pace, today, running, theme, xp, rewards },
      ctx,
    ),
  );
  const [now, setNow] = useState(() => Date.now());
  const [dialog, setDialog] = useState<DialogName>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [harvested, setHarvested] = useState(
    timer.phase === "focus" && timer.status === "finished",
  );
  const [end, setEnd] = useState<{ focusMin: number; fruitsToday: number } | null>(null);
  // 1º pomodoro do onboarding: depois da folha 07 vem o "Primeiro fruto" (tela 20).
  const firstFruit = useRef(false);
  const [suggestion, setSuggestion] = useState<{
    ema: number;
    current: number;
    next: "break" | "skip";
    finished: boolean;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [askNotif, setAskNotif] = useState(shouldAskNotification);
  const [sound, setSound] = useState(soundEnabled);
  const handling = useRef(false);
  const timerRef = useRef(timer);
  // Computador (≥ 1024px): cena larga, painel à esquerda e atalhos Espaço/F.
  const wide = useWide();
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const shortcutRef = useRef<(e: KeyboardEvent) => void>(() => {});

  const absorbXp = useCallback(
    (res: XpResult | null) => {
      if (!res) return;
      setXpTotal(res.xpTotal);
      if (rewards && res.levelTo > res.levelFrom) {
        const prev = pendingLevel.current;
        pendingLevel.current = {
          from: prev ? Math.min(prev.from, res.levelFrom) : res.levelFrom,
          to: Math.max(prev?.to ?? 0, res.levelTo),
        };
      }
    },
    [rewards],
  );

  const update = useCallback((t: TimerState) => {
    timerRef.current = t;
    setTimer(t);
    saveState(t);
  }, []);

  // Pergunta ao servidor (90%, frutos de hoje) e abre o fim do ciclo.
  const finalizeFocus = useCallback(
    async (t: TimerState, delayMs: number) => {
      if (!t.sessionId) return;
      const res = await completePomodoro(t.sessionId);
      if (!res.ok) {
        if (res.error === "Este ciclo foi encerrado.") {
          update(readyState("focus", settings.focus, ctx(t.cyclesDone)));
          setHarvested(false);
        }
        setError(res.error);
        return;
      }
      setError(null);
      setEnd(res.data);
      absorbXp(res.data.xp);
      if (res.data.firstFruit) firstFruit.current = true;
      const n = res.data.fruitsToday;
      const fruits = `${n} ${n === 1 ? "fruto" : "frutos"} hoje`;
      const gained = rewards ? (res.data.xp?.xpGained ?? 0) : 0;
      // O toast abre depois do diálogo para ficar por cima do véu. O XP vem do servidor.
      window.setTimeout(() => {
        setDialog("end");
        setToast(gained > 0 ? `+${gained} XP · ${fruits}` : fruits);
      }, delayMs);
    },
    [absorbXp, ctx, rewards, settings.focus, update],
  );

  // Fim do foco: colheita na cena, som, notificação (aba oculta) e conclusão no servidor.
  const completeFocus = useCallback(
    (t: TimerState, alert: boolean) => {
      update(finish(t));
      setHarvested(true);
      if (alert) {
        if (soundEnabled()) playChime();
        const focusMin = Math.round(t.plannedSec / 60);
        const shown = notify(
          "cycle_end",
          "Fruto colhido!",
          `${focusMin} min de foco${subject ? ` em ${subject.title}` : ""}. Quantas páginas você leu?`,
        );
        if (!shown && document.visibilityState === "hidden") blinkTitle("🍅 Fruto colhido!");
      }
      return finalizeFocus(t, alert ? 1200 : 0);
    },
    [finalizeFocus, subject, update],
  );

  const breakEnded = useCallback(
    (t: TimerState, alert: boolean) => {
      if (alert) {
        if (soundEnabled()) playChime();
        const shown = notify(
          "break_end",
          "Descanso concluído",
          "O próximo ciclo está pronto quando você estiver.",
        );
        if (!shown && document.visibilityState === "hidden") blinkTitle("🌱 Descanso concluído");
      }
      update(readyState("focus", settings.focus, ctx(nextCycles(t, today))));
    },
    [ctx, settings.focus, today, update],
  );

  const onTimeUp = useRef(completeFocus);
  const onBreakUp = useRef(breakEnded);
  useEffect(() => {
    onTimeUp.current = completeFocus;
    onBreakUp.current = breakEnded;
  }, [completeFocus, breakEnded]);

  // Na montagem: ciclo de outra disciplina abre a tela dele; foco já encerrado reabre o fim.
  useEffect(() => {
    const t = timerRef.current;
    // (Um descanso não prende: ele termina na disciplina que a pessoa abriu.)
    if (
      t.phase === "focus" &&
      t.status !== "ready" &&
      t.subjectId &&
      t.subjectId !== (subject?.id ?? null)
    ) {
      const params = new URLSearchParams({ disciplina: t.subjectId });
      if (t.topicId) params.set("topico", t.topicId);
      router.replace(`/pomodoro?${params.toString()}`);
    }
    saveState(t);
    if (t.phase === "focus" && t.status === "finished") void finalizeFocus(t, 0);
    // Só na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Relógio: 1×/s enquanto corre e ao voltar para a aba. O fim da fase vem dos
  // timestamps, então funciona mesmo se a aba ficou oculta o tempo todo.
  const running_ = timer.status === "running";
  useEffect(() => {
    if (!running_) return;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      const t = timerRef.current;
      if (handling.current || !isTimeUp(t, n)) return;
      handling.current = true;
      const alert = overdueMs(t, n) < LATE_MS;
      const run =
        t.phase === "focus"
          ? onTimeUp.current(t, alert)
          : Promise.resolve(onBreakUp.current(t, alert));
      void run.finally(() => {
        handling.current = false;
      });
    };
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running_]);

  // Tempo no título da aba.
  useEffect(() => {
    if (timer.status === "ready" || timer.status === "finished") {
      document.title = "Pomodoro · Pomar";
      return;
    }
    const label =
      timer.phase === "focus" ? (timer.status === "paused" ? "Pausado" : "Foco") : "Descanso";
    document.title = `${formatTimer(remainingSec(timer, now))} · ${label} · Pomar`;
  }, [timer, now]);
  useEffect(() => () => void (document.title = "Pomar"), []);

  // Tela cheia: o estado vem do navegador (Esc sai, como em qualquer página). Ao sair
  // da tela do pomodoro, a tela cheia acaba junto.
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", update);
    return () => {
      document.removeEventListener("fullscreenchange", update);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Atalhos (lib/shortcuts.ts): o ouvinte é um só; a ação usa o estado mais recente.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => shortcutRef.current(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ações ------------------------------------------------------------------------

  async function beginFocus(cyclesDone: number) {
    const res = await startPomodoro(subject?.id ?? null, topic?.id ?? null);
    if (!res.ok) {
      setError(res.error);
      return false;
    }
    const row = res.data;
    const st = row.resumed
      ? fromSession(row, cyclesDone, today)
      : start(readyState("focus", row.planned_focus_sec / 60, ctx(cyclesDone)), Date.now(), row.id);
    update(st);
    setError(null);
    if (row.resumed && row.subject_id !== (subject?.id ?? null) && row.subject_id) {
      router.replace(
        `/pomodoro?disciplina=${row.subject_id}${row.topic_id ? `&topico=${row.topic_id}` : ""}`,
      );
    }
    return true;
  }

  async function onStart() {
    unlockAudio();
    setBusy(true);
    await beginFocus(timer.cyclesDone);
    setBusy(false);
  }

  function onPause() {
    if (!timer.sessionId) return;
    update(pause(timer, Date.now()));
    setDialog("pause");
    void track("pause_nudge_shown");
    void pausePomodoro(timer.sessionId);
  }

  async function onRestart() {
    if (!timer.sessionId) return;
    void track("pause_nudge_choice", { choice: "restart" });
    setBusy(true);
    await cancelPomodoro(timer.sessionId, "restart");
    const ok = await beginFocus(timer.cyclesDone);
    if (!ok) update(readyState("focus", settings.focus, ctx(timer.cyclesDone)));
    setBusy(false);
    setDialog("none");
  }

  function onResume() {
    if (!timer.sessionId) return;
    if (dialog === "pause") void track("pause_nudge_choice", { choice: "continue" });
    update(resume(timer, Date.now()));
    setDialog("none");
    void resumePomodoro(timer.sessionId);
  }

  async function onCancel() {
    if (!timer.sessionId) return;
    setBusy(true);
    const res = await cancelPomodoro(timer.sessionId, "user");
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    update(readyState("focus", settings.focus, ctx(timer.cyclesDone)));
    setDialog("none");
  }

  function proceed(next: "break" | "skip", finishedTopic: boolean) {
    const cycles = timer.cyclesDone + 1;
    setDialog("none");
    setSuggestion(null);
    setHarvested(false);
    setEnd(null);
    if (firstFruit.current) {
      // Fim do 1º pomodoro do onboarding: o descanso fica para depois do "Primeiro fruto".
      firstFruit.current = false;
      update(readyState("focus", settings.focus, ctx(cycles)));
      router.push("/onboarding/primeiro-fruto");
      return;
    }
    if (next === "break") {
      const phase = breakAfter(cycles);
      const minutes = phase === "long_break" ? settings.longBreak : settings.shortBreak;
      update(start(readyState(phase, minutes, ctx(cycles)), Date.now()));
    } else {
      const kept = breakAfter(cycles) === "long_break" ? 0 : cycles;
      update(readyState("focus", settings.focus, ctx(kept)));
    }
    if (finishedTopic && subject) {
      router.replace(`/pomodoro?disciplina=${subject.id}`);
    }
    // Nível: celebração em tela cheia se a árvore mudou de estágio; senão, toast.
    const level = pendingLevel.current;
    pendingLevel.current = null;
    if (level) {
      if (stageChanged(level.from, level.to)) setCelebration(level);
      else {
        setToast(`Nível ${level.to}!`);
        void markLevelSeen(level.to);
      }
    }
    router.refresh();
  }

  async function onConfirmPages(pages: number, finishTopic: boolean, next: "break" | "skip") {
    if (!timer.sessionId) return;
    setBusy(true);
    const res = await logPages(timer.sessionId, pages, finishTopic);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    absorbXp(res.data.xp);
    const { suggest, ema, currentPace } = res.data;
    if (suggest && ema !== null && currentPace !== null && subject) {
      setSuggestion({ ema, current: currentPace, next, finished: finishTopic });
      return;
    }
    proceed(next, finishTopic);
  }

  async function onAnswerSuggestion(accept: boolean) {
    if (!suggestion || !subject) return;
    setBusy(true);
    const res = await answerPaceSuggestion(subject.id, accept);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (accept) setToast("Ritmo atualizado");
    proceed(suggestion.next, suggestion.finished);
  }

  async function onSaveSettings(values: CycleSettings, soundOn: boolean) {
    setBusy(true);
    const res = await saveCycleSettings(values);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSoundEnabled(soundOn);
    setSound(soundOn);
    setSettings(values);
    setError(null);
    if (timer.status === "ready") update(readyState("focus", values.focus, ctx(timer.cyclesDone)));
    setDialog("none");
  }

  function onSkipBreak() {
    update(readyState("focus", settings.focus, ctx(nextCycles(timer, today))));
  }

  async function onAllowNotifications() {
    markNotificationAsked();
    setAskNotif(false);
    try {
      await Notification.requestPermission();
    } catch {
      // Navegador sem suporte: o app avisa com som e título da aba.
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void rootRef.current?.requestFullscreen?.().catch(() => {
        // Navegador sem permissão para tela cheia: nada muda.
      });
    }
  }

  // Espaço passa pelo mesmo caminho do botão Pausar (abre o nudge, §4.5) ou do
  // Continuar; F alterna a tela cheia. Nada disso vale com um diálogo aberto.
  useEffect(() => {
    shortcutRef.current = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const action = shortcutFor(
        { ...pickKeys(e), target },
        {
          wide,
          dialogOpen:
            dialog !== "none" ||
            celebration !== null ||
            document.querySelector('dialog[open], [aria-modal="true"]') !== null,
        },
      );
      if (!action) return;
      e.preventDefault();
      if (action === "fullscreen") {
        toggleFullscreen();
        return;
      }
      const cur = timerRef.current;
      if (cur.phase !== "focus") return;
      if (cur.status === "running") onPause();
      else if (cur.status === "paused") onResume();
    };
  });

  // Tela ---------------------------------------------------------------------------

  const t = timer;
  const isFocus = t.phase === "focus";
  const remaining = remainingSec(t, now);
  const quantized = Math.floor(elapsedMs(t, now) / 5000) * 5000;
  const sceneProgress = isFocus ? quantized / (t.plannedSec * 1000) : 0;
  const label = !isFocus ? "Descanso" : t.status === "paused" ? "Pausado" : "Foco";
  const dots = isFocus
    ? t.cyclesDone % LONG_BREAK_EVERY
    : t.cyclesDone % LONG_BREAK_EVERY || LONG_BREAK_EVERY;
  const backHref = subject ? `/disciplinas/${subject.id}` : "/inicio";
  const endTopic: EndTopic | null = topic
    ? { title: topic.title, predictedLabel: topic.predictedLabel }
    : null;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  const controls = (variant: "sheet" | "panel") => (
    <PomodoroControls
      variant={variant}
      isFocus={isFocus}
      status={t.status}
      pauseDialogOpen={dialog === "pause"}
      busy={busy}
      error={error}
      askNotif={askNotif}
      onStart={onStart}
      onPause={onPause}
      onEnd={() => setDialog("cancel")}
      onResume={onResume}
      onRetry={() => void finalizeFocus(t, 0)}
      onSkipBreak={onSkipBreak}
      onAllowNotifications={onAllowNotifications}
      onDismissNotifications={() => {
        markNotificationAsked();
        setAskNotif(false);
      }}
    />
  );
  const srLabel = `${label}: ${mm} ${mm === 1 ? "minuto" : "minutos"} e ${ss} segundos restantes`;
  const stage = stageForLevel(levelForXp(xpTotal));

  return (
    <div
      ref={rootRef}
      data-theme={theme}
      className="fixed inset-0 z-40 overflow-hidden bg-[var(--scene-sky-bottom)]"
    >
      {wide ? (
        <>
          <WideScene
            theme={sceneTheme}
            stage={stage}
            progress={sceneProgress}
            harvested={harvested && isFocus}
          />

          <div className="absolute inset-x-8 top-6 flex items-center justify-between">
            <Link
              href="/inicio"
              className="pc-glass inline-flex min-h-12 items-center gap-2 rounded-full pr-[18px] pl-3 text-[15px] font-extrabold text-[var(--pc-ink)]"
            >
              <ChevronLeft size={22} aria-hidden />
              Início
            </Link>
            <div className="flex gap-2.5">
              {t.status === "ready" && (
                <button
                  type="button"
                  onClick={() => setDialog("settings")}
                  aria-label="Ajustar ciclo"
                  className="pc-glass grid size-12 place-items-center rounded-full text-[var(--pc-ink)]"
                >
                  <SlidersHorizontal size={22} aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                aria-keyshortcuts="F"
                className="pc-glass grid size-12 place-items-center rounded-full text-[var(--pc-ink)]"
              >
                {fullscreen ? (
                  <Minimize size={22} aria-hidden />
                ) : (
                  <Maximize size={22} aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div className="absolute top-[clamp(88px,14.7vh,132px)] left-16 flex flex-col items-start gap-3 xl:left-[120px]">
            <DesktopPanel
              chip={!isFocus ? "Descanso" : t.status === "paused" ? "Pausa" : "Foco"}
              seconds={remaining}
              srLabel={srLabel}
              cyclesDone={dots}
              currentCycle={isFocus ? dots + 1 : null}
              showRipening={isFocus}
              ripening={sceneProgress}
              fruit={THEMES[sceneTheme].fruit}
              subjectTitle={subject?.title ?? null}
              topicTitle={topic?.title ?? null}
              topicDetail={topic?.detail ?? null}
            >
              {controls("panel")}
            </DesktopPanel>
            <p className="pc-glass rounded-full px-2.5 py-1 text-xs font-extrabold text-[var(--pc-ink)]">
              Espaço pausa · F tela cheia
            </p>
          </div>
        </>
      ) : (
        <>
          <Scene
            theme={sceneTheme}
            stage={stage}
            progress={sceneProgress}
            harvested={harvested && isFocus}
            withTimer
          />

          <div className="max-w-app relative mx-auto flex h-full w-full flex-col">
            <div className="flex items-center justify-between px-3 pt-3">
              <Link
                href={backHref}
                aria-label={subject ? `Voltar para ${subject.title}` : "Voltar para o início"}
                className="grid size-11 place-items-center rounded-full bg-[var(--glass-fill)] text-[var(--scene-ink)]"
              >
                <ChevronLeft size={26} aria-hidden />
              </Link>
              {t.status === "ready" && (
                <button
                  type="button"
                  onClick={() => setDialog("settings")}
                  aria-label="Ajustar ciclo"
                  className="grid size-11 place-items-center rounded-full bg-[var(--glass-fill)] text-[var(--scene-ink)]"
                >
                  <SlidersHorizontal size={22} aria-hidden />
                </button>
              )}
            </div>

            <div className="flex justify-center pt-[clamp(16px,6vh,72px)]">
              <GlassTimer
                halo={THEMES[sceneTheme].layout.timer}
                label={label}
                seconds={remaining}
                srLabel={srLabel}
              />
            </div>

            <div className="mt-auto rounded-t-[28px] bg-[var(--scene-sheet)] px-4 pt-[18px] pb-[max(28px,env(safe-area-inset-bottom))] text-[var(--scene-ink)] shadow-[0_-8px_24px_var(--glass-shade)]">
              <div className="flex flex-col items-center gap-3">
                <p className="text-center font-extrabold">
                  {subject ? subject.title : "Sessão livre"}
                  {topic ? ` · ${topic.title}` : ""}
                </p>
                <div
                  role="img"
                  className="flex gap-2"
                  aria-label={`Ciclo ${dots} de ${LONG_BREAK_EVERY} antes do descanso longo`}
                >
                  {Array.from({ length: LONG_BREAK_EVERY }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={`size-2.5 rounded-full ${i < dots ? "bg-[var(--scene-fruit-ripe)]" : "bg-[var(--scene-sheet-border)] opacity-40"}`}
                    />
                  ))}
                </div>
                {controls("sheet")}
              </div>
            </div>
          </div>
        </>
      )}

      <PauseDialog
        open={dialog === "pause"}
        busy={busy}
        onRestart={onRestart}
        onContinue={onResume}
      />

      <Dialog
        open={dialog === "cancel"}
        onClose={() => setDialog("none")}
        labelledBy="encerrar-titulo"
        variant="card"
      >
        <div className="flex flex-col gap-4">
          <h2 id="encerrar-titulo" className="text-title">
            Encerrar este ciclo?
          </h2>
          <p className="text-ink-muted">
            O fruto deste ciclo não vai ser colhido, mas tudo bem: você pode começar outro quando
            quiser.
          </p>
          <Button size="lg" variant="secondary" onClick={onCancel} disabled={busy}>
            Encerrar ciclo
          </Button>
          <Button variant="ghost" onClick={() => setDialog("none")} disabled={busy}>
            Voltar ao foco
          </Button>
        </div>
      </Dialog>

      {dialog === "settings" && (
        <CycleSettingsDialog
          open
          initial={settings}
          sound={sound}
          saving={busy}
          error={error}
          onClose={() => setDialog("none")}
          onSave={onSaveSettings}
        />
      )}

      {end && (
        <EndOfCycleDialog
          open={dialog === "end"}
          subjectTitle={subject?.title ?? null}
          focusMin={end.focusMin}
          topic={endTopic}
          predictedPages={topic?.predictedPages ?? 0}
          currentPace={pace}
          breakMin={
            breakAfter(t.cyclesDone + 1) === "long_break" ? settings.longBreak : settings.shortBreak
          }
          busy={busy}
          error={error}
          suggestion={suggestion}
          onConfirm={onConfirmPages}
          onAnswerSuggestion={onAnswerSuggestion}
        />
      )}

      {celebration && (
        <LevelUpCelebration
          from={celebration.from}
          to={celebration.to}
          xp={xpTotal}
          theme={sceneTheme}
          onContinue={() => {
            void markLevelSeen(celebration.to);
            setCelebration(null);
          }}
        />
      )}

      <Toast open={toast !== null} onDone={() => setToast(null)} title={toast ?? ""} />
    </div>
  );
}

/** Campos do evento de teclado que os atalhos usam (lib/shortcuts.ts). */
function pickKeys(e: KeyboardEvent) {
  const { key, code, repeat, altKey, ctrlKey, metaKey, shiftKey } = e;
  return { key, code, repeat, altKey, ctrlKey, metaKey, shiftKey };
}
