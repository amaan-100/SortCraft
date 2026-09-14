import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ScrollableTableProps {
  children: ReactNode;
  /** Announced to screen readers and used for the keyboard-focus region. */
  label: string;
  /** Shown under the table on small screens when the content overflows. */
  hint?: string;
  className?: string;
}

/**
 * Wraps ONLY the table in a horizontally scrollable, keyboard-focusable region.
 * The document itself never scrolls sideways because the wrapper is `w-full`
 * with `max-w-full` and `min-w-0`.
 */
export function ScrollableTable({
  children,
  label,
  hint = "Swipe horizontally to view all metrics.",
  className,
}: ScrollableTableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="w-full min-w-0 max-w-full">
      <div
        ref={ref}
        // tabIndex makes the scroll region reachable with the keyboard so the
        // content is not trapped for non-pointer users.
        tabIndex={0}
        role="region"
        aria-label={label}
        className={cn(
          "w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60",
          className
        )}
      >
        {children}
      </div>
      {overflowing && (
        <p className="mt-2 flex items-center gap-1.5 px-4 pb-1 text-xs text-slate-500 dark:text-slate-500">
          <MoveHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {hint}
        </p>
      )}
    </div>
  );
}
