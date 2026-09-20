import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * An instrument panel — a chrome caption bar (optionally with traffic-light
 * dots and a mono title) over a body. This is the signature container of the
 * SortCraft "engineering instrument" identity.
 */
export function Panel({
  title,
  dots = true,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  dots?: boolean;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const hasChrome = title || dots || action;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-surface",
        className
      )}
    >
      {hasChrome && (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {dots && (
              <span className="flex items-center gap-1.5" aria-hidden>
                <span className="h-[7px] w-[7px] rounded-full bg-rose-500/70" />
                <span className="h-[7px] w-[7px] rounded-full bg-amber-400/70" />
                <span className="h-[7px] w-[7px] rounded-full bg-emerald-500/70" />
              </span>
            )}
            {title !== undefined && title !== null && (
              <span className="truncate font-mono text-[11px] text-muted">
                {title}
              </span>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}