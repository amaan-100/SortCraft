import { motion } from "framer-motion";
import type { ActionType, SortStep } from "@/algorithms/types";
import { Panel } from "@/components/ui/Panel";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const actionStyles: Record<ActionType, string> = {
  COMPARE: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  SWAP: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  SHIFT: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  OVERWRITE: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  PIVOT: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  INSERT: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  MARK_SORTED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  COMPLETE: "bg-emerald-500 text-[#04201d]",
};

export function ExplanationPanel({
  step,
  stepIndex,
}: {
  step: SortStep | null;
  stepIndex: number;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <Panel
      dots={false}
      title="CURRENT OPERATION"
      action={
        step && (
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
              actionStyles[step.action]
            }`}
          >
            {step.action}
          </span>
        )
      }
    >
      <div className="p-4">
        <motion.p
          key={stepIndex}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
          className="text-sm leading-relaxed text-ink"
        >
          {step?.explanation ??
            "Press Play or Next step to begin. The array below is the unsorted input."}
        </motion.p>
        {step && step.indices.length > 0 && (
          <p className="mt-3 font-mono text-xs text-muted">
            Affected indices: [{step.indices.join(", ")}]
          </p>
        )}
      </div>
    </Panel>
  );
}