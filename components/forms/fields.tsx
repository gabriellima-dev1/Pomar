"use client";

import { useFormStatus } from "react-dom";
import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ name, label, error, hint, id, ...rest }: TextFieldProps) {
  const inputId = id ?? `campo-${name}`;
  const describedBy = [error && `${inputId}-erro`, hint && `${inputId}-dica`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="border-border bg-surface aria-invalid:border-danger min-h-11 rounded-lg border px-3 text-base"
        {...rest}
      />
      {hint && !error && (
        <p id={`${inputId}-dica`} className="text-muted text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-erro`} className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingText,
}: {
  children: ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground min-h-11 rounded-lg px-4 font-semibold disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-border bg-surface rounded-lg border px-3 py-2 text-sm">
      {message}
    </p>
  );
}
