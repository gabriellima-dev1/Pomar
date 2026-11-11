import { RewardsQueue } from "@/components/gamification/RewardsQueue";
import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { themeScript } from "@/components/theme/script";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { BottomNav } from "@/components/ui/BottomNav";
import { requireUser } from "@/lib/auth/session";
import { addDays } from "@/lib/dates";
import { getBadgeHistory, getGameProfile, getUnlockedThemes } from "@/lib/gamification/queries";
import { ensureDaysClosed } from "@/lib/gamification/service";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  // Fechamento "preguiçoso" dos dias anteriores ao abrir o app (DESIGN §6.4).
  // Idempotente e barato quando ontem já foi fechado; uma falha nunca bloqueia o app.
  try {
    await ensureDaysClosed(user.id);
  } catch (error) {
    console.error("[gamificação] fechamento do dia", error);
  }

  const [profile, history, themes] = await Promise.all([
    getGameProfile(user.id),
    getBadgeHistory(),
    getUnlockedThemes(),
  ]);
  const recent = history.filter((b) => b.day >= addDays(profile.today, -60));
  const unseenBadges = recent.filter((b) => !b.seen);
  const unseenThemes = themes.filter((t) => !t.seen).map((t) => t.code);
  const levelFrom = Math.min(profile.levelSeen, profile.level);
  // Coorte B (Fase 4, `rewards_enabled = false`): sem as telas 12–14 (telas.md › Fase 3).
  const rewardsEnabled = true;
  // Pendências novas (ex.: subir de nível ao marcar um tópico) recriam a fila.
  const queueKey = [
    unseenBadges.map((b) => b.day).join(","),
    unseenThemes.join(","),
    `${levelFrom}-${profile.level}`,
  ].join("|");

  return (
    <div className="flex flex-1 flex-col">
      {/* Tema antes da primeira pintura; ThemeSync mantém nas navegações. */}
      <script dangerouslySetInnerHTML={{ __html: themeScript(profile.theme) }} />
      <ThemeSync theme={profile.theme} />
      <TrackOnMount event="app_opened" once="session" />
      <main className="max-w-app mx-auto flex w-full flex-1 flex-col px-4 pt-4 pb-36">
        {children}
      </main>
      <BottomNav />
      {rewardsEnabled && (
        <RewardsQueue
          key={queueKey}
          badges={unseenBadges}
          history={recent}
          themes={unseenThemes}
          levelFrom={levelFrom}
          levelTo={profile.level}
          xp={profile.xp}
          today={profile.today}
          theme={profile.theme}
        />
      )}
    </div>
  );
}
