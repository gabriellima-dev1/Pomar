import "server-only";
import { experimentGroup, rewardsCohort, rewardsEnabled } from "@/lib/cohorts";
import type { AdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { FeedDraft } from "./feed";

/**
 * Gravação dos itens do feed (chave secreta). Nunca bloqueia o fluxo principal:
 * uma falha aqui só vira aviso no log.
 */
export async function recordFeed(
  admin: AdminClient,
  userId: string,
  drafts: readonly FeedDraft[],
): Promise<void> {
  if (drafts.length === 0) return;
  const rows = (list: readonly FeedDraft[]) =>
    list.map((d) => ({
      user_id: userId,
      type: d.type,
      payload: d.payload as unknown as Json,
      dedupe_key: d.dedupe_key,
    }));
  try {
    // A colheita é 1 item por semana que sobe de faixa: atualiza o mesmo item.
    const harvests = drafts.filter((d) => d.type === "harvest");
    const others = drafts.filter((d) => d.type !== "harvest");
    if (harvests.length > 0) {
      const { error } = await admin.from("feed_events").upsert(
        rows(harvests).map((r) => ({ ...r, created_at: new Date().toISOString() })),
        { onConflict: "user_id,dedupe_key" },
      );
      if (error) console.warn("[feed] colheita", error.message);
    }
    if (others.length > 0) {
      const { error } = await admin
        .from("feed_events")
        .upsert(rows(others), { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
      if (error) console.warn("[feed]", error.message);
    }
  } catch (error) {
    console.warn("[feed]", error);
  }
}

/** A pessoa vê recompensas (coorte A)? Mesma regra de lib/account.ts, pela chave secreta. */
export async function rewardsFor(admin: AdminClient, userId: string): Promise<boolean> {
  const [{ data: cohortRow }, { data: flag }] = await Promise.all([
    admin.from("user_cohorts").select("cohort, left_at").eq("user_id", userId).maybeSingle(),
    admin
      .from("feature_flags")
      .select("enabled, rollout")
      .eq("key", "rewards_enabled")
      .maybeSingle(),
  ]);
  return rewardsEnabled(rewardsCohort(experimentGroup(cohortRow)), flag ?? null);
}
