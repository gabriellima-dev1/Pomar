import Link from "next/link";
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
      <Link href="/" className="self-start text-lg font-bold">
        🍅 Pomar
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted">{subtitle}</p>
      </div>
      {children}
      <p className="text-muted text-center text-sm">{footer}</p>
    </main>
  );
}

export function Divider() {
  return (
    <div className="text-muted flex items-center gap-3 text-sm" role="separator">
      <span className="bg-border h-px flex-1" />
      ou
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
