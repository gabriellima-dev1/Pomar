import "server-only";
import { cache } from "react";
import {
  isBartleProfile,
  parseAnswers,
  parseScores,
  type Answers,
  type BartleProfile,
  type Scores,
} from "@/lib/bartle";
import {
  experimentGroup,
  rewardsCohort,
  rewardsEnabled,
  type ExperimentGroup,
} from "@/lib/cohorts";
import { parseStep, type OnboardingStep } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

/**
 * Estado da conta usado pelo onboarding, pelo destaque do Início e pelas
 * Configurações (sessão do usuário: a RLS filtra).
 */
export type Account = {
  name: string | null;
  step: OnboardingStep;
  bartle: BartleProfile | null;
  scores: Scores | null;
  answers: Answers;
  /** null = ainda não escolheu (sem pré-marcação, §6.6). */
  leagueOptIn: boolean | null;
  leagueInviteDismissed: boolean;
  /** Grupo do experimento (§9.4); "fora" = saiu do experimento (ou sem coorte). */
  experiment: ExperimentGroup;
  /** Coorte B (§9.4) não vê XP, emblemas e colheitas. */
  rewards: boolean;
};

export const getAccount = cache(async (userId: string): Promise<Account> => {
  const supabase = await createClient();
  const [{ data: p }, { data: cohortRow }, { data: flag }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, onboarding_step, bartle_primary, bartle_scores, bartle_answers, league_opt_in, league_invite_dismissed_at",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_cohorts").select("cohort, left_at").eq("user_id", userId).maybeSingle(),
    supabase
      .from("feature_flags")
      .select("enabled, rollout")
      .eq("key", "rewards_enabled")
      .maybeSingle(),
  ]);
  const experiment = experimentGroup(cohortRow);
  return {
    name: p?.display_name?.split(" ")[0] ?? null,
    step: parseStep(p?.onboarding_step),
    bartle: isBartleProfile(p?.bartle_primary) ? p.bartle_primary : null,
    scores: parseScores(p?.bartle_scores),
    answers: parseAnswers(p?.bartle_answers),
    leagueOptIn: p?.league_opt_in ?? null,
    leagueInviteDismissed: p?.league_invite_dismissed_at != null,
    experiment,
    rewards: rewardsEnabled(rewardsCohort(experiment), flag ?? null),
  };
});

/** Disciplina mais recente (a 1ª, durante o onboarding). */
export async function latestSubjectId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
