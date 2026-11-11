import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "lg" | "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 text-center font-extrabold select-none transition-[transform,box-shadow] duration-100 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-button active:translate-y-1 active:shadow-none disabled:active:translate-y-0",
  secondary: "border-2 border-control-border bg-surface-200 text-primary",
  ghost: "bg-transparent text-primary",
  danger: "bg-danger text-surface-100",
};

const sizes: Record<ButtonSize, string> = {
  lg: "min-h-14 rounded-lg px-6 text-lg",
  md: "min-h-12 rounded-md px-5",
  sm: "min-h-11 rounded-md px-4 text-sm",
};

/** Classes do botão, para usar também em `<Link>`. Um primário por tela (design system). */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className = "", type = "button", ...rest }: Props) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}
