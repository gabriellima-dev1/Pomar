import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, Divider } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SignupForm } from "@/components/auth/SignupForm";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: PageProps<"/cadastro">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const loginHref = next === "/inicio" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      title="Plante seu pomar"
      subtitle="Crie sua conta grátis. Cada pomodoro concluído vira um fruto."
      footer={
        <>
          Já tem conta?{" "}
          <Link href={loginHref} className="text-primary font-semibold underline">
            Entrar
          </Link>
        </>
      }
    >
      <GoogleButton next={next} />
      <Divider />
      <SignupForm next={next} />
    </AuthShell>
  );
}
