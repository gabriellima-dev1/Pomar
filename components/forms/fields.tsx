"use client";

import { useFormStatus } from "react-dom";
import type { InputHTMLAttributes, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

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
      <label htmlFor={inputId} className="font-extrabold">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="border-control-border bg-surface-200 text-ink placeholder:text-ink-muted aria-invalid:border-danger min-h-12 rounded-md border-2 px-4 text-base"
        {...rest}
      />
      {hint && !error && (
        <p id={`${inputId}-dica`} className="text-small text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-erro`} className="text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  className = "",
  name,
  value,
}: {
  children: ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      name={name}
      value={value}
      className={buttonClasses(variant, size, className)}
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="bg-fruit-soft text-ink text-small rounded-md px-4 py-3">
      {message}
    </p>
  );
}
