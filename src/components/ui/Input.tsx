import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium text-ink"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-md border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/40",
          error
            ? "border-rose-400"
            : "border-line-strong hover:border-fg/30 focus:border-brand-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}