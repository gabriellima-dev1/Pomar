import { createClient } from "@/lib/supabase/client";
import { getAnonId } from "@/lib/telemetry/anon-id";
import { createTracker } from "@/lib/telemetry/tracker";

export type { EventName, EventProps } from "@/lib/telemetry/events";

/**
 * `track(name, props)` no navegador. Insere em `telemetry_events` via RLS
 * (user_id da sessão, ou só anon_id para visitantes).
 * No servidor, use `trackServer` de `@/lib/telemetry.server`.
 */
export const track = createTracker({
  async getUserId() {
    const { data } = await createClient().auth.getSession();
    return data.session?.user.id ?? null;
  },
  getAnonId,
  insert: (row) => createClient().from("telemetry_events").insert(row),
  onError(error) {
    if (process.env.NODE_ENV !== "production") console.warn("[telemetria]", error);
  },
});
