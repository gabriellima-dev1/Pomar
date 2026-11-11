import type { ReactNode } from "react";

/** Aviso curto de confirmação (`role="status"`), em `--primary-soft`. */
export function Notice({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "info" }) {
  return (
    <p
      role="status"
      className={`text-small rounded-md px-4 py-3 ${
        tone === "ok" ? "bg-primary-soft text-ink" : "bg-surface-300 text-ink-muted"
      }`}
    >
      {children}
    </p>
  );
}
