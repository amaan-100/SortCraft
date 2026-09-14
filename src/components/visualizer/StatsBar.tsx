import { ArrowLeftRight, Hash, Layers, Scale } from "lucide-react";
import type { SortStep } from "@/algorithms/types";

interface StatsBarProps {
  step: SortStep | null;
  stepIndex: number;
  totalSteps: number;
  onSeek: (index: number) => void;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <span className="shrink-0 text-brand-600 dark:text-brand-400">{icon}</span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
          {label}
        </p>
        <p
          title={String(value)}
          className="truncate font-mono text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function StatsBar({ step, stepIndex, totalSteps, onSeek }: StatsBarProps) {
  const displayStep = stepIndex + 1;
  const progress = totalSteps > 0 ? (displayStep / totalSteps) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          icon={<Scale className="h-4 w-4" />}
          label="Comparisons"
          value={step?.comparisons ?? 0}
        />
        <Stat
          icon={<ArrowLeftRight className="h-4 w-4" />}
          label="Swaps / moves"
          value={step?.swaps ?? 0}
        />
        <Stat
          icon={<Hash className="h-4 w-4" />}
          label="Step"
          value={`${displayStep} / ${totalSteps}`}
        />
        <Stat
          icon={<Layers className="h-4 w-4" />}
          label="Phase"
          value={step?.phase ?? "Not started"}
        />
      </div>

      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={-1}
          max={Math.max(totalSteps - 1, 0)}
          value={stepIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Scrub through the sorting steps"
          className="mt-2 w-full text-slate-400"
        />
      </div>
    </div>
  );
}
