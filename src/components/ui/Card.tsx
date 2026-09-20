import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface",
        "shadow-[0_1px_2px_rgb(0_0_0/0.03)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-fg">
        {icon}
        {title}
      </div>
      {action}
    </div>
  );
}