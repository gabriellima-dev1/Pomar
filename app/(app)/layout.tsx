import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { BottomNav } from "@/components/ui/BottomNav";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();

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
