import { cn } from "@/utils/cn";

export interface ComplexityProps {
  /** e.g. "O(n log n)", "O(n²)", "O(n + k)", "O(log n) space" */
  value: string;
  className?: string;
  /** Renders a subtle chip background (used inside metric tiles). */
  tone?: "plain" | "chip";
  /**
   * Font size. Defaults to `sm` — deliberately readable. Use `xs` only inside
   * dense tables; never smaller.
   */
  size?: "xs" | "sm" | "base";
}

const sizes = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
} as const;

/**
 * Renders a Big-O expression on a single line at every viewport width.
 * The `.complexity` class (src/index.css) supplies:
 *   white-space: nowrap; display: inline-block; min-width: max-content;
 *   word-break: keep-all; overflow-wrap: normal; flex-shrink: 0;
 */
export function Complexity({
  value,
  className,
  tone = "plain",
  size = "sm",
}: ComplexityProps) {
  return (
    <span
      className={cn(
        "complexity whitespace-nowrap min-w-max shrink-0 font-mono font-semibold tabular-nums",
        sizes[size],
        tone === "chip" &&
          "rounded-md bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800/70",
        className
      )}
    >
      {value}
    </span>
  );
}
