import Link from "next/link";
import { SeuTomas } from "@/components/mascot/SeuTomas";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Link
        href="/"
        className="font-display inline-flex items-center gap-2 self-start text-xl font-semibold"
      >
        <SeuTomas size={32} />
        Pomar
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-title">{title}</h1>
        <p className="text-ink-muted">{subtitle}</p>
      </div>
      {children}
      <p className="text-ink-muted text-center text-sm">{footer}</p>
      <p className="text-ink-muted text-center text-xs">
        Ao continuar, você concorda com a nossa{" "}
        <Link href="/privacidade" className="underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </main>
  );
}

export function Divider() {
  return (
    <div className="text-ink-muted flex items-center gap-3 text-sm" role="separator">
      <span className="bg-surface-300 h-px flex-1" />
      ou
      <span className="bg-surface-300 h-px flex-1" />
    </div>
  );
}
