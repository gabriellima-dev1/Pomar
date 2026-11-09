import Link from "next/link";
import { TrackOnMount } from "@/components/telemetry/TrackOnMount";
import { requireUser } from "@/lib/auth/session";
import { signOut } from "./actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();

  return (
    <div className="flex flex-1 flex-col">
      <TrackOnMount event="app_opened" once="session" />
      <header className="border-border bg-surface border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/inicio" className="mr-2 text-lg font-bold">
              🍅 Pomar
            </Link>
            <nav aria-label="Principal" className="flex">
              <Link
                href="/disciplinas"
                className="text-muted hover:text-foreground inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium"
              >
                Disciplinas
              </Link>
            </nav>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-muted hover:text-foreground min-h-11 rounded-lg px-3 text-sm font-medium"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
