import type { SortStep } from "@/algorithms/types";
import { cn } from "@/utils/cn";

/** Lightweight, non-animated bar renderer used in the comparison grid. */
export function MiniBars({
  values,
  step,
  height = 140,
}: {
  values: number[];
  step: SortStep | null;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  return (
    <div
      className="flex w-full min-w-0 max-w-full items-end gap-px overflow-hidden rounded-lg bg-slate-100/70 p-2 dark:bg-slate-950/60"
      style={{ height }}
    >
      {values.map((value, index) => {
        const active = step?.indices.includes(index);
        const sorted = step?.sortedIndices.includes(index);
        return (
          <div
            key={index}
            className={cn(
              "min-w-0 flex-1 rounded-t-[2px] transition-[height] duration-150",
              sorted
                ? "bg-emerald-500"
                : active
                  ? "bg-rose-500"
                  : "bg-slate-400 dark:bg-slate-600"
            )}
            style={{ height: `${(value / max) * 100}%` }}
          />
        );
      })}
    </div>
  );
}
