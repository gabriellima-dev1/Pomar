"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, ChevronLeft, SlidersHorizontal } from "lucide-react";
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
import { Scene } from "@/components/scenes/Scene";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Toast } from "@/components/ui/Toast";
import { track } from "@/lib/telemetry";
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
import { EndOfCycleDialog, type EndTopic } from "./EndOfCycleDialog";
import { GlassTimer } from "./GlassTimer";
import { PauseDialog } from "./PauseDialog";

export type PomodoroTopic = {
  id: string;
  title: string;
  /** Páginas previstas para este ciclo e o intervalo ("p. 68–74"). */
  predictedPages: number;
  predictedLabel: string | null;
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
}: PomodoroProps) {
  const router = useRouter();
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
    initialTimer({ subject, topic, settings: initialSettings, pace, today, running }, ctx),
  );
  const [now, setNow] = useState(() => Date.now());
  const [dialog, setDialog] = useState<DialogName>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [harvested, setHarvested] = useState(
    timer.phase === "focus" && timer.status === "finished",
  );
  const [end, setEnd] = useState<{ focusMin: number; fruitsToday: number } | null>(null);
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
      const n = res.data.fruitsToday;
      // O toast abre depois do diálogo para ficar por cima do véu.
      window.setTimeout(() => {
        setDialog("end");
        setToast(`${n} ${n === 1 ? "fruto" : "frutos"} hoje`);
      }, delayMs);
    },
    [ctx, settings.focus, update],
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

  return (
    <div
      data-theme="classico"
      className="fixed inset-0 z-40 overflow-hidden bg-[var(--scene-sky-bottom)]"
    >
      <Scene progress={sceneProgress} harvested={harvested && isFocus} />

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
            label={label}
            seconds={remaining}
            srLabel={`${label}: ${mm} ${mm === 1 ? "minuto" : "minutos"} e ${ss} segundos restantes`}
          />
        </div>

        <div className="mt-auto rounded-t-[28px] bg-[var(--scene-sheet)] px-4 pt-[18px] pb-[max(28px,env(safe-area-inset-bottom))] text-[var(--scene-ink)] shadow-[0_-8px_24px_var(--glass-shade)]">
          <div className="flex flex-col items-center gap-3">
            <p className="text-center font-extrabold">
              {subject ? subject.title : "Sessão livre"}
              {topic ? ` · ${topic.title}` : ""}
            </p>
            <div
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

            {askNotif && isFocus && t.status === "running" && (
              <div className="flex w-full items-start gap-3 rounded-md bg-[var(--surface-200)] p-3">
                <BellRing
                  size={20}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-[var(--scene-sheet-action)]"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <p className="text-small">
                    Quer que eu avise quando o ciclo terminar, mesmo em outra aba?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onAllowNotifications}>
                      Avisar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        markNotificationAsked();
                        setAskNotif(false);
                      }}
                    >
                      Agora não
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="text-small w-full rounded-md bg-[var(--fruit-soft)] px-3 py-2 text-[var(--ink)]"
              >
                {error}
              </p>
            )}

            <div className="flex w-full gap-2">
              {isFocus && t.status === "ready" && (
                <Button size="lg" className="flex-1" onClick={onStart} disabled={busy}>
                  {busy ? "Começando…" : "Começar foco"}
                </Button>
              )}
              {isFocus && t.status === "running" && (
                <>
                  <SheetButton kind="secondary" onClick={onPause}>
                    Pausar
                  </SheetButton>
                  <SheetButton kind="ghost" onClick={() => setDialog("cancel")}>
                    Encerrar
                  </SheetButton>
                </>
              )}
              {isFocus && t.status === "paused" && dialog !== "pause" && (
                <>
                  <Button size="lg" className="flex-1" onClick={onResume}>
                    Continuar
                  </Button>
                  <SheetButton kind="ghost" onClick={() => setDialog("cancel")}>
                    Encerrar
                  </SheetButton>
                </>
              )}
              {isFocus && t.status === "finished" && error && (
                <Button size="lg" className="flex-1" onClick={() => void finalizeFocus(t, 0)}>
                  Tentar de novo
                </Button>
              )}
              {!isFocus && (
                <SheetButton kind="secondary" onClick={onSkipBreak}>
                  Pular descanso
                </SheetButton>
              )}
            </div>
          </div>
        </div>
      </div>

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

      <Toast open={toast !== null} onDone={() => setToast(null)} title={toast ?? ""} />
    </div>
  );
}

/** Botões da folha do pomodoro, com as cores da cena (referencias/08). */
function SheetButton({
  kind,
  onClick,
  children,
}: {
  kind: "secondary" | "ghost";
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-md font-extrabold text-[var(--scene-sheet-action)] ${
        kind === "secondary"
          ? "flex-1 border-2 border-[var(--scene-sheet-border)] bg-[var(--surface-200)]"
          : "px-5"
      }`}
    >
      {children}
    </button>
  );
}
