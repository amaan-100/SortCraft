import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import type { ActionType, SortStep } from "@/algorithms/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const actionStyles: Record<ActionType, string> = {
  COMPARE: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  SWAP: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  SHIFT: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  OVERWRITE: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  PIVOT: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  INSERT: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  MARK_SORTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  COMPLETE: "bg-emerald-600 text-white dark:bg-emerald-600",
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
    <Card>
      <CardHeader
        title="Current operation"
        icon={<MessageSquareText className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        action={
          step && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                actionStyles[step.action]
              }`}
            >
              {step.action}
            </span>
          )
        }
      />
      <div className="px-4 py-4">
        <motion.p
          key={stepIndex}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
          className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"
        >
          {step?.explanation ??
            "Press Play or Next step to begin. The array below is the unsorted input."}
        </motion.p>
        {step && step.indices.length > 0 && (
          <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-500">
            Affected indices: [{step.indices.join(", ")}]
          </p>
        )}
      </div>
    </Card>
  );
}
