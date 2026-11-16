"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useSyncExternalStore, type ReactNode } from "react";
import { ChevronRight, Download, FlaskConical } from "lucide-react";
import {
  deleteAccount,
  leaveExperiment,
  saveDisplayName,
  setPublicProfile,
} from "@/app/(app)/configuracoes/actions";
import { saveCycleSettings } from "@/app/(app)/pomodoro/actions";
import type { ActionFormState } from "@/components/forms/ActionForm";
import { FormMessage, SubmitButton, TextField } from "@/components/forms/fields";
import { LeagueChoice } from "@/components/league/LeagueChoice";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import {
  cycleAlertsEnabled,
  notificationState,
  setCycleAlertsEnabled,
  setSoundEnabled,
  soundEnabled,
  subscribePrefs,
  type NotificationState,
} from "@/components/pomodoro/alerts";
import { CycleSettingsDialog, type CycleSettings } from "@/components/pomodoro/CycleSettingsDialog";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import type { ExperimentGroup } from "@/lib/cohorts";
import {
  cycleSummary,
  DELETE_WORD,
  deleteConfirmationMatches,
  deleteConfirmationTarget,
  NAME_MAX,
} from "@/lib/settings";
import { RowText, rowClasses } from "./rows";

/** Linha que abre um diálogo. */
function RowButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <button type="button" onClick={onClick} className={rowClasses}>
        <RowText label={label} value={value} />
        <ChevronRight size={22} aria-hidden className="text-ink-muted shrink-0" />
      </button>
    </li>
  );
}

/** Linha com caixa de marcar à direita (a linha inteira é o rótulo). */
function RowCheckbox({
  label,
  value,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  value?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <li>
      <label className={`${rowClasses} cursor-pointer`}>
        <RowText label={label} value={value} />
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
      </label>
    </li>
  );
}

// CONTA ---------------------------------------------------------------------------

export function NameRow({ name }: { name: string | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, action] = useActionState<ActionFormState, FormData>(async (prev, formData) => {
    const res = await saveDisplayName(prev, formData);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
    return res;
  }, {});
  return (
    <>
      <RowButton label="Nome" value={name ?? "Sem nome"} onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="nome-titulo">
        <form action={action} className="flex flex-col gap-4" noValidate>
          <h2 id="nome-titulo" className="text-title">
            Seu nome
          </h2>
          <TextField
            name="nome"
            label="Nome"
            defaultValue={name ?? ""}
            maxLength={NAME_MAX}
            autoComplete="name"
            hint="Aparece só para você. Na Feira e entre amigos aparece o apelido."
          />
          <FormMessage message={state.error} />
          <SubmitButton size="lg" pendingText="Salvando…">
            Salvar nome
          </SubmitButton>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </form>
      </Dialog>
    </>
  );
}

export function PublicProfileRow({
  username,
  initial,
}: {
  username: string | null;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!username) {
    return (
      <li>
        <Link href="/liga/apelido?depois=/configuracoes" className={rowClasses}>
          <RowText
            label="Perfil público"
            value="Escolha um apelido para poder deixar o perfil público"
          />
          <ChevronRight size={22} aria-hidden className="text-ink-muted shrink-0" />
        </Link>
      </li>
    );
  }
  return (
    <>
      <RowCheckbox
        label="Perfil público"
        value={error ?? "Nível, árvore, ofensiva e emblemas"}
        checked={on}
        disabled={busy}
        onChange={async (next) => {
          setBusy(true);
          setOn(next);
          const res = await setPublicProfile(next);
          setBusy(false);
          if (!res.ok) {
            setOn(!next);
            setError(res.error ?? "Não consegui salvar agora.");
          } else setError(null);
        }}
      />
    </>
  );
}

// ESTUDO --------------------------------------------------------------------------

export function CycleRow({ settings }: { settings: CycleSettings }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sound = useSyncExternalStore(subscribePrefs, soundEnabled, () => true);
  return (
    <>
      <RowButton
        label="Ciclo do pomodoro"
        value={cycleSummary(settings.focus, settings.shortBreak, settings.longBreak)}
        onClick={() => setOpen(true)}
      />
      {open && (
        <CycleSettingsDialog
          open
          initial={settings}
          sound={sound}
          saving={busy}
          error={error}
          onClose={() => setOpen(false)}
          onSave={async (values, soundOn) => {
            setBusy(true);
            const res = await saveCycleSettings(values);
            setBusy(false);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setSoundEnabled(soundOn);
            setError(null);
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

export function SoundRow() {
  const on = useSyncExternalStore(subscribePrefs, soundEnabled, () => true);
  return (
    <RowCheckbox label="Tocar som ao terminar" checked={on} onChange={(v) => setSoundEnabled(v)} />
  );
}

const ALERT_HINT: Record<NotificationState, string> = {
  "sem-suporte": "Este navegador não mostra notificações; o app avisa com som e no título da aba.",
  pedir: "Notificação do navegador quando a aba está escondida",
  permitido: "Notificação do navegador quando a aba está escondida",
  bloqueado:
    "O navegador bloqueou as notificações. Para liberar, clique no cadeado ao lado do endereço e permita notificações.",
};

/** "Aviso de fim do ciclo": ligar pede a permissão do navegador (nunca antes disso). */
export function AlertRow() {
  const enabled = useSyncExternalStore(subscribePrefs, cycleAlertsEnabled, () => false);
  const permission = useSyncExternalStore(
    subscribePrefs,
    notificationState,
    (): NotificationState => "pedir",
  );
  const checked = enabled && permission === "permitido";
  return (
    <RowCheckbox
      label="Aviso de fim do ciclo"
      value={ALERT_HINT[permission]}
      checked={checked}
      disabled={permission === "sem-suporte" || permission === "bloqueado"}
      onChange={async (next) => {
        if (!next) {
          setCycleAlertsEnabled(false);
          return;
        }
        if (notificationState() === "pedir") {
          try {
            await Notification.requestPermission();
          } catch {
            // Navegador sem suporte: segue com som e título da aba.
          }
        }
        setCycleAlertsEnabled(true);
      }}
    />
  );
}

// JOGO ----------------------------------------------------------------------------

export function FeiraRow({ optIn, summary }: { optIn: boolean | null; summary: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RowButton label="Feira" value={summary} onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="feira-titulo">
        <div className="flex flex-col gap-4">
          <h2 id="feira-titulo" className="text-title">
            Feira
          </h2>
          <p className="text-ink-muted">
            Ranking semanal com quem estuda um tempo parecido. Só aparecem o seu apelido e o seu XP
            da semana.
          </p>
          <LeagueChoice context="configuracoes" initial={optIn} submitLabel="Salvar escolha" />
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </Dialog>
    </>
  );
}

// PRIVACIDADE E DADOS ---------------------------------------------------------------

/**
 * Card do experimento (telas.md › 31): some para quem está fora (conta antiga ou já saiu).
 * Sair pede uma confirmação simples.
 */
export function ExperimentCard({ group }: { group: ExperimentGroup }) {
  if (group === "fora") return null;
  return (
    <div className="bg-surface-200 shadow-card flex flex-col gap-4 rounded-lg p-5">
      <div className="flex gap-4">
        <span className="bg-surface-300 text-primary grid size-12 shrink-0 place-items-center rounded-full">
          <FlaskConical size={24} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="text-heading">Experimento da disciplina</h3>
          <p className="text-ink-muted">
            {group === "A"
              ? "Você está no grupo que vê as recompensas."
              : "Você está no grupo que não vê as recompensas."}{" "}
            Saiba o que medimos e por quê.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/transparencia#experimento" className={buttonClasses("secondary", "md")}>
          Ver transparência
        </Link>
        <LeaveExperimentButton back="/configuracoes" variant="ghost" />
      </div>
    </div>
  );
}

/** "Sair do experimento" com confirmação simples (Configurações e Transparência). */
export function LeaveExperimentButton({
  back,
  variant,
  className = "",
}: {
  back: "/configuracoes" | "/transparencia";
  variant: "ghost" | "secondary";
  className?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setConfirm(true)} className={className}>
        Sair do experimento
      </Button>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        labelledBy="sair-exp-titulo"
        variant="card"
      >
        <form action={leaveExperiment} className="flex flex-col gap-4">
          <input type="hidden" name="depois" value={back} />
          <h2 id="sair-exp-titulo" className="text-title">
            Sair do experimento?
          </h2>
          <p className="text-ink-muted">
            Você passa a ver todas as recompensas, inclusive o que já ganhou, e seus dados deixam de
            entrar na comparação entre os grupos. Não dá para voltar ao grupo depois.
          </p>
          <SubmitButton size="lg" variant="secondary" pendingText="Saindo…">
            Sair do experimento
          </SubmitButton>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Continuar no experimento
          </Button>
        </form>
      </Dialog>
    </>
  );
}

export function ExportCard() {
  return (
    <div className="bg-surface-200 shadow-card flex flex-col gap-4 rounded-lg p-5">
      <div className="flex gap-4">
        <span className="bg-primary-soft text-primary grid size-12 shrink-0 place-items-center rounded-full">
          <Download size={24} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="text-heading">Exportar meus dados</h3>
          <p className="text-ink-muted">
            Um arquivo JSON com perfil, disciplinas, pomodoros e conquistas.
          </p>
        </div>
      </div>
      <a href="/api/export" download className={buttonClasses("secondary", "md", "self-start")}>
        Baixar arquivo
      </a>
    </div>
  );
}

/** "Excluir conta" (tela 32): 1 clique abre a confirmação; nada escondido. */
export function DeleteAccount({ username }: { username: string | null }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [state, action] = useActionState<ActionFormState, FormData>(deleteAccount, {});
  const target = deleteConfirmationTarget(username);
  const ready = deleteConfirmationMatches(typed, username);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-danger min-h-12 self-center px-5 text-lg font-extrabold"
      >
        Excluir conta
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="excluir-titulo">
        <form action={action} className="flex flex-col gap-4" noValidate>
          <SeuTomas size={64} mood="pensativo" />
          <h2 id="excluir-titulo" className="text-title">
            Excluir sua conta?
          </h2>
          <p className="text-ink-muted">
            Isso apaga para sempre seu perfil, suas disciplinas, os pomodoros, as conquistas e sua
            vaga na Feira. Não dá para desfazer.
          </p>
          <p className="bg-surface-100 rounded-lg px-4 py-3">
            Quer guardar uma cópia antes?{" "}
            <a href="/api/export" download className="text-primary-strong font-extrabold underline">
              Baixar meus dados
            </a>
          </p>
          <label className="flex flex-col gap-2">
            <span className="font-extrabold">
              Para confirmar, digite {username ? "seu apelido" : `a palavra ${DELETE_WORD}`}:{" "}
              <span className="text-danger">{target}</span>
            </span>
            <input
              name="confirmacao"
              value={typed}
              onChange={(e) => setTyped(e.currentTarget.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="border-control-border bg-surface-200 min-h-14 rounded-lg border-2 px-4 text-lg font-extrabold"
            />
          </label>
          <FormMessage message={state.error} />
          <DeleteSubmit ready={ready} />
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </form>
      </Dialog>
    </>
  );
}

/** Desabilitado (`--surface-300`) até o texto bater; habilitado = `--danger`. */
function DeleteSubmit({ ready }: { ready: boolean }) {
  return ready ? (
    <SubmitButton size="lg" variant="danger" pendingText="Excluindo…">
      Excluir para sempre
    </SubmitButton>
  ) : (
    <button
      type="button"
      disabled
      className="bg-surface-300 text-ink-muted inline-flex min-h-14 cursor-not-allowed items-center justify-center rounded-lg px-6 text-lg font-extrabold"
    >
      Excluir para sempre
    </button>
  );
}
