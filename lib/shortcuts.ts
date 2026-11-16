/**
 * Atalhos do pomodoro no computador (telas.md › Pomodoro no computador): Espaço
 * pausa/retoma e F entra/sai da tela cheia. Só valem a partir de 1024px e são
 * ignorados quando o foco está num campo, num botão ou link (o Espaço nativo deles
 * continua valendo, sem disparar duas vezes) ou quando há um diálogo aberto.
 */

export type Shortcut = "toggle" | "fullscreen";

/** O que importa do evento de teclado (KeyboardEvent tem tudo isso). */
export type KeyInput = {
  key: string;
  code?: string;
  repeat?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  /** Elemento com o foco (o `target` do evento). */
  target?: {
    tagName?: string;
    isContentEditable?: boolean;
    getAttribute?: (name: string) => string | null;
  } | null;
};

export type ShortcutContext = {
  /** Tela com pelo menos 1024px (abaixo disso, nada muda). */
  wide: boolean;
  /** Algum diálogo aberto (pausa, encerrar, ajustar, fim do ciclo, celebração). */
  dialogOpen: boolean;
};

const TYPING = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const ACTIVATABLE = new Set(["BUTTON", "A", "SUMMARY"]);
const ACTIVATABLE_ROLES = new Set([
  "button",
  "link",
  "checkbox",
  "switch",
  "tab",
  "menuitem",
  "option",
  "radio",
  "slider",
  "textbox",
  "combobox",
  "spinbutton",
]);

/** O foco está num lugar onde a tecla já tem outro significado? */
export function isInteractiveTarget(target: KeyInput["target"]): boolean {
  if (!target) return false;
  const tag = (target.tagName ?? "").toUpperCase();
  if (TYPING.has(tag) || ACTIVATABLE.has(tag)) return true;
  if (target.isContentEditable) return true;
  const role = target.getAttribute?.("role");
  return role ? ACTIVATABLE_ROLES.has(role) : false;
}

export function shortcutFor(event: KeyInput, ctx: ShortcutContext): Shortcut | null {
  if (!ctx.wide || ctx.dialogOpen) return null;
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return null;
  if (isInteractiveTarget(event.target)) return null;
  if (event.code === "Space" || event.key === " " || event.key === "Spacebar") {
    return event.shiftKey ? null : "toggle";
  }
  if (event.key === "f" || event.key === "F") return "fullscreen";
  return null;
}
