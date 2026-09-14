import { motion } from "framer-motion";
import type { SortStep } from "@/algorithms/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/utils/cn";

export type BarState = "idle" | "compare" | "selected" | "moved" | "sorted" | "pivot";

const barClasses: Record<BarState, string> = {
  idle: "bg-slate-400 dark:bg-slate-600",
  compare: "bg-rose-500 dark:bg-rose-500",
  selected: "bg-amber-400 dark:bg-amber-400",
  moved: "bg-orange-500 dark:bg-orange-500",
  sorted: "bg-emerald-500 dark:bg-emerald-500",
  pivot: "bg-violet-500 dark:bg-violet-500",
};

const MOVE_ACTIONS = ["SWAP", "SHIFT", "INSERT", "OVERWRITE"];

function resolveState(index: number, step: SortStep | null): BarState {
  if (!step) return "idle";
  const active = step.indices.includes(index);
  if (active) {
    if (step.action === "PIVOT") return "pivot";
    if (step.action === "COMPARE") return "compare";
    if (MOVE_ACTIONS.includes(step.action)) return "moved";
  }
  if (step.sortedIndices.includes(index)) return "sorted";
  if (step.selectedIndices.includes(index)) return "selected";
  if (active) return "compare";
  return "idle";
}

export interface BarChartProps {
  values: number[];
  step: SortStep | null;
}

export function BarChart({ values, step }: BarChartProps) {
  const reduced = usePrefersReducedMotion();
  const max = Math.max(...values, 1);
  const showValues = values.length <= 30;
  const showIndices = values.length <= 20;

  return (
    <div
      // min-w-0 + max-w-full keep the chart inside the card at 320px; the bars
      // flex down rather than forcing the document to scroll sideways.
      className="flex h-[320px] w-full min-w-0 max-w-full items-end gap-px overflow-hidden rounded-lg bg-slate-100/70 p-2 sm:h-[420px] sm:gap-[2px] sm:p-3 dark:bg-slate-950/60"
      role="img"
      aria-label={`Array visualization with ${values.length} bars. ${
        step?.explanation ?? "Ready to sort."
      }`}
    >
      {values.map((value, index) => {
        const state = resolveState(index, step);
        const heightPct = (value / max) * 100;
        const lifted = state === "compare" || state === "moved" || state === "pivot";
        return (
          <div
            key={index}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <motion.div
              className={cn(
                "w-full rounded-t-[3px]",
                barClasses[state],
                lifted && "ring-2 ring-white/60 dark:ring-white/30"
              )}
              initial={false}
              animate={{
                height: `${heightPct}%`,
                y: reduced ? 0 : lifted ? -6 : 0,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 32, mass: 0.6 }
              }
            />
            {showValues && (
              <span className="mt-1 text-center font-mono text-[10px] leading-none text-slate-600 dark:text-slate-400">
                {value}
              </span>
            )}
            {showIndices && (
              <span className="text-center font-mono text-[9px] leading-tight text-slate-400 dark:text-slate-600">
                {index}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
