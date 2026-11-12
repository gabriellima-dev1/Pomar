import "server-only";
import { canAdvance, type OnboardingStep } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

/**
 * Avança o onboarding de `from` para `to`, só se a pessoa estiver em `from` (quem já
 * terminou, ou está em outro passo, não muda). Devolve se avançou.
 */
export async function advanceOnboarding(
  userId: string,
  from: OnboardingStep,
  to: OnboardingStep,
): Promise<boolean> {
  if (!canAdvance(from, to)) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ onboarding_step: to })
    .eq("id", userId)
    .eq("onboarding_step", from)
    .select("id");
  if (error) {
    console.error("[onboarding] avançar passo", error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}
