import { Scene } from "@/components/scenes/Scene";
import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { themeScript } from "@/components/theme/script";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { requireUser } from "@/lib/auth/session";
import { getGameProfile } from "@/lib/gamification/queries";

/**
 * Onboarding (telas 16–20): sem BottomNav. No celular, coluna única; a partir de
 * 1024px, card central de até 480px sobre a cena Campo em tela cheia (telas.md ›
 * Computador e tablet).
 */
export default async function OnboardingLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const profile = await getGameProfile(user.id);

  return (
    <div className="relative flex flex-1 flex-col">
      <script dangerouslySetInnerHTML={{ __html: themeScript(profile.theme) }} />
      <ThemeSync theme={profile.theme} />
      <TrackOnMount event="app_opened" once="session" />
      <div data-theme="classico" aria-hidden className="fixed inset-0 hidden lg:block">
        <div className="absolute inset-0 bg-[var(--scene-sky-bottom)]" />
        <Scene
          theme="classico"
          still
          orchard={false}
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <main className="max-w-app bg-surface-100 relative mx-auto flex w-full flex-1 flex-col lg:my-10 lg:flex-none lg:overflow-hidden lg:rounded-lg lg:shadow-[var(--shadow-dialog)]">
        {children}
      </main>
    </div>
  );
}
