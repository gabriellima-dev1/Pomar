import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Início" };

/** Provisória: os cards das disciplinas chegam na Fase 2. */
export default async function InicioPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.display_name ?? "estudante";

  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold">Olá, {name}! 🌱</h1>
      <p className="text-muted max-w-prose">
        Comece cadastrando o que você vai estudar. Em breve, cada pomodoro concluído vai colher um
        fruto no seu pomar.
      </p>
      <Link
        href="/disciplinas"
        className="bg-primary text-primary-foreground inline-flex min-h-11 items-center self-start rounded-lg px-4 font-semibold"
      >
        Ver minhas disciplinas
      </Link>
    </section>
  );
}
