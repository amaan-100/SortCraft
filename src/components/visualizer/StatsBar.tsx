import type { SortStep } from "@/algorithms/types";

interface StatsBarProps {
  step: SortStep | null;
  stepIndex: number;
  totalSteps: number;
  onSeek: (index: number) => void;
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 px-4 py-2.5">
      <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="truncate font-mono text-sm text-fg tabular-nums">{value}</p>
    </div>
  );
}

export function StatsBar({ step, stepIndex, totalSteps, onSeek }: StatsBarProps) {
  const displayStep = stepIndex + 1;
  const progress = totalSteps > 0 ? (displayStep / totalSteps) * 100 : 0;

  return (
    <div>
      <dl className="grid min-w-0 grid-cols-2 divide-line border-t border-line bg-surface-2/40 sm:grid-cols-4 sm:divide-x">
        <Cell label="Step" value={`${displayStep} / ${totalSteps}`} />
        <Cell label="Comparisons" value={step?.comparisons ?? 0} />
        <Cell label="Swaps" value={step?.swaps ?? 0} />
        <Cell label="Phase" value={step?.phase ?? "Not started"} />
      </dl>

      <div className="px-4 pb-1 pt-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
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
          className="mt-3 w-full text-fg"
        />
      </div>
    </div>
  );
}