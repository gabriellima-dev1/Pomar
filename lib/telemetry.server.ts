import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createTracker } from "@/lib/telemetry/tracker";
import type { EventName, EventProps } from "@/lib/telemetry/events";

/**
 * `track` para Server Actions e Route Handlers. Usa a sessão da requisição
 * (RLS: só grava eventos do próprio usuário).
 */
export async function trackServer(name: EventName, props?: EventProps): Promise<void> {
  const supabase = await createClient();
  const track = createTracker({
    async getUserId() {
      const { data } = await supabase.auth.getClaims();
      return data?.claims?.sub ?? null;
    },
    getAnonId: () => null,
    insert: (row) => supabase.from("telemetry_events").insert(row),
    onError(error) {
      console.warn("[telemetria]", error);
    },
  });
  await track(name, props);
}
