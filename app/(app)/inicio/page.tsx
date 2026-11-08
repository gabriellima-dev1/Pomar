import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Início" };

/** Placeholder da Fase 0. Os cards das disciplinas chegam na Fase 2. */
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
        Seu pomar está sendo preparado. Em breve você poderá cadastrar suas disciplinas e colher
        seus primeiros frutos.
      </p>
    </section>
  );
}
