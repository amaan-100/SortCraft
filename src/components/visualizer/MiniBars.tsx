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
      className="flex w-full min-w-0 max-w-full items-end gap-px overflow-hidden rounded-md bg-canvas p-2 [background-image:linear-gradient(to_top,var(--line)_1px,transparent_1px)] [background-size:100%_25%]"
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
              sorted ? "bg-emerald-500" : active ? "bg-rose-500" : "bg-line-strong"
            )}
            style={{ height: `${(value / max) * 100}%` }}
          />
        );
      })}
    </div>
  );
}