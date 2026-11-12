import type { Metadata } from "next";
import { UsernameForm } from "@/components/league/UsernameForm";
import { MascotBubble } from "@/components/ui/MascotBubble";
import { TopBar } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth/session";
import { suggestUsername } from "@/lib/league/username";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Escolha seu apelido" };

const RETURNS = ["/liga", "/liga?aba=amigos", "/configuracoes"];

/**
 * Escolher apelido (referencias/24-liga-apelido.png): abre na primeira entrada na
 * Feira ou em Amigos e também a partir de Configurações (trocar apelido e perfil público).
 */
export default async function ApelidoPage({ searchParams }: PageProps<"/liga/apelido">) {
  const user = await requireUser();
  const { depois } = await searchParams;
  const returnTo = typeof depois === "string" && RETURNS.includes(depois) ? depois : "/liga";
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("username, public_profile, display_name")
    .eq("id", user.id)
    .maybeSingle();
  const editing = Boolean(p?.username);

  return (
    <section className="flex min-h-[calc(100dvh-8rem)] flex-col gap-6">
      <TopBar
        backHref={editing || returnTo === "/configuracoes" ? returnTo : "/inicio"}
        backLabel="Fechar"
        icon="fechar"
      />
      <MascotBubble>
        Na Feira e entre amigos, você aparece pelo apelido. Seu nome e seu e-mail ficam só com você.
      </MascotBubble>
      <h1 className="text-title">{editing ? "Seu apelido" : "Escolha seu apelido"}</h1>
      <UsernameForm
        initialUsername={p?.username ?? null}
        suggestion={suggestUsername(p?.display_name ?? null, user.email)}
        initialPublic={p?.public_profile ?? false}
        returnTo={returnTo}
      />
    </section>
  );
}
