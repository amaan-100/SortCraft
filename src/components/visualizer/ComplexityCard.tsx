import { Boxes, CircleCheck, CircleX } from "lucide-react";
import type { Algorithm } from "@/algorithms/types";
import { Complexity } from "@/components/ui/Complexity";
import { Panel } from "@/components/ui/Panel";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-md bg-surface-2 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <Complexity value={value} className="mt-0.5" size="sm" />
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          : "bg-surface-2 text-muted"
      }`}
    >
      {ok ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export function ComplexityCard({ algorithm }: { algorithm: Algorithm }) {
  const { complexity } = algorithm;
  return (
    <Panel dots={false} title={`${algorithm.name.toUpperCase()} — COMPLEXITY`}>
      <div className="space-y-4 p-4">
        <p className="text-sm leading-relaxed text-ink">{algorithm.description}</p>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Best" value={complexity.best} />
          <Metric label="Average" value={complexity.average} />
          <Metric label="Worst" value={complexity.worst} />
          <Metric label="Space" value={complexity.space} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Flag ok={complexity.stable} label={complexity.stable ? "Stable" : "Unstable"} />
          <Flag
            ok={complexity.inPlace}
            label={complexity.inPlace ? "In-place" : "Not in-place"}
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
            <Boxes className="h-3.5 w-3.5" />
            Comparison sort
          </span>
        </div>
      </div>
    </Panel>
  );
}