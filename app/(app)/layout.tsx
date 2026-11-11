import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { BottomNav } from "@/components/ui/BottomNav";
import { requireUser } from "@/lib/auth/session";
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

  return (
    <div className="flex flex-1 flex-col">
      <TrackOnMount event="app_opened" once="session" />
      <main className="max-w-app mx-auto flex w-full flex-1 flex-col px-4 pt-4 pb-36">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
