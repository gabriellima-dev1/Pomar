import { isEventName, type EventName, type EventProps } from "./events";

export const MAX_PROPS_BYTES = 4096;

export type TelemetryRow = {
  name: EventName;
  props: EventProps;
  user_id: string | null;
  anon_id: string | null;
};

export type TrackerDeps = {
  getUserId: () => Promise<string | null>;
  getAnonId: () => string | null;
  insert: (row: TelemetryRow) => PromiseLike<{ error: unknown }>;
  onError?: (error: unknown) => void;
};

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** Monta a linha do evento, ou `null` se o evento for inválido. Função pura. */
export function buildEventRow(
  name: unknown,
  props: EventProps | undefined,
  ids: { userId: string | null; anonId: string | null },
): TelemetryRow | null {
  if (!isEventName(name)) return null;
  let safeProps: EventProps = props ?? {};
  if (byteLength(JSON.stringify(safeProps)) > MAX_PROPS_BYTES) {
    safeProps = { _truncated: true };
  }
  return { name, props: safeProps, user_id: ids.userId, anon_id: ids.anonId };
}

/**
 * Cria um `track()` fire-and-forget: nunca lança erro e nunca bloqueia a UI.
 * A promessa retornada serve só para testes / `waitUntil`.
 */
export function createTracker(deps: TrackerDeps) {
  return function track(name: EventName, props?: EventProps): Promise<void> {
    const run = async () => {
      const userId = await deps.getUserId().catch(() => null);
      const row = buildEventRow(name, props, { userId, anonId: deps.getAnonId() });
      if (!row) throw new Error(`Evento de telemetria desconhecido: ${String(name)}`);
      const { error } = await deps.insert(row);
      if (error) throw error;
    };
    return run().catch((error: unknown) => deps.onError?.(error));
  };
}
