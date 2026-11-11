import { Check } from "lucide-react";
import type { ComponentProps } from "react";

/** Checkbox de 24px em `--primary` (o input nativo continua acessível; o visto é desenho). */
export function Checkbox({ className = "", ...rest }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span className={`relative inline-grid size-6 shrink-0 place-items-center ${className}`}>
      <input
        type="checkbox"
        className="peer border-control-border bg-surface-200 checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary size-6 cursor-pointer appearance-none rounded-[6px] border-2"
        {...rest}
      />
      <Check
        size={18}
        strokeWidth={3.5}
        aria-hidden
        className="text-on-primary pointer-events-none absolute hidden peer-checked:block"
      />
      <span
        aria-hidden
        className="bg-on-primary pointer-events-none absolute hidden h-[3px] w-3 rounded-full peer-indeterminate:block"
      />
    </span>
  );
}
