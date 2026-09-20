import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-[#04201d] hover:bg-brand-400 active:bg-brand-600 focus-visible:ring-brand-500/50",
  secondary:
    "bg-surface-2 text-fg hover:bg-surface-3 focus-visible:ring-fg/25 border border-line",
  ghost:
    "bg-transparent text-ink hover:text-fg hover:bg-surface-2 focus-visible:ring-fg/25",
  danger:
    "bg-rose-500 text-white hover:bg-rose-400 active:bg-rose-600 focus-visible:ring-rose-500/50",
  outline:
    "border border-line bg-transparent text-fg hover:bg-surface-2 hover:border-line-strong focus-visible:ring-fg/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-[15px] gap-2",
  icon: "h-9 w-9 justify-center",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center rounded-md font-medium transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}