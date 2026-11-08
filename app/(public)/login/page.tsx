import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, Divider } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { CALLBACK_ERRORS } from "@/lib/auth/errors";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const erro = typeof params.erro === "string" ? CALLBACK_ERRORS[params.erro] : undefined;
  const cadastroHref =
    next === "/inicio" ? "/cadastro" : `/cadastro?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      title="Que bom te ver!"
      subtitle="Entre para continuar cuidando do seu pomar."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href={cadastroHref} className="text-primary font-semibold underline">
            Criar conta
          </Link>
        </>
      }
    >
      <GoogleButton next={next} />
      <Divider />
      <LoginForm next={next} initialError={erro} />
    </AuthShell>
  );
}
