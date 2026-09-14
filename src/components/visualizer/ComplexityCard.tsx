import { Boxes, CircleCheck, CircleX, Gauge } from "lucide-react";
import type { Algorithm } from "@/algorithms/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Complexity } from "@/components/ui/Complexity";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <Complexity
        value={value}
        className="text-slate-900 dark:text-slate-100"
        size="sm"
      />
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
    <Card>
      <CardHeader
        title={`${algorithm.name} — complexity`}
        icon={<Gauge className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
      />
      <div className="space-y-4 p-4">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {algorithm.description}
        </p>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Best case" value={complexity.best} />
          <Metric label="Average case" value={complexity.average} />
          <Metric label="Worst case" value={complexity.worst} />
          <Metric label="Space" value={complexity.space} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Flag ok={complexity.stable} label={complexity.stable ? "Stable" : "Unstable"} />
          <Flag
            ok={complexity.inPlace}
            label={complexity.inPlace ? "In-place" : "Not in-place"}
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <Boxes className="h-3.5 w-3.5" />
            Comparison sort
          </span>
        </div>
      </div>
    </Card>
  );
}
