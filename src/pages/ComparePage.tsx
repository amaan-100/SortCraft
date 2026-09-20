import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Crown,
  Flag,
  Medal,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { algorithmList, algorithms } from "@/algorithms";
import type { AlgorithmId, SortOrder } from "@/algorithms/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Complexity } from "@/components/ui/Complexity";
import { Panel } from "@/components/ui/Panel";
import { ScrollableTable } from "@/components/ui/ScrollableTable";
import { Slider } from "@/components/ui/Slider";
import { MiniBars } from "@/components/visualizer/MiniBars";
import { speedToDelay } from "@/hooks/useSortPlayer";
import { useProgress } from "@/context/ProgressContext";
import { MAX_SIZE, MIN_SIZE, randomArray } from "@/utils/array";
import { cn } from "@/utils/cn";

const DEFAULT_SELECTION: AlgorithmId[] = ["bubble", "insertion", "merge", "quick"];

const ordinal = (n: number): string => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

export default function ComparePage() {
  const { markComparisonUsed } = useProgress();
  const [selected, setSelected] = useState<AlgorithmId[]>(DEFAULT_SELECTION);
  const [order, setOrder] = useState<SortOrder>("asc");
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(75);
  const [array, setArray] = useState(() => randomArray(30));
  const [tick, setTick] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    markComparisonUsed();
  }, [markComparisonUsed]);

  const runs = useMemo(
    () =>
      selected.map((id) => ({
        algorithm: algorithms[id],
        steps: algorithms[id].generateSteps(array, order),
      })),
    [selected, array, order]
  );

  const maxTicks = useMemo(
    () => runs.reduce((m, r) => Math.max(m, r.steps.length), 0),
    [runs]
  );

  useEffect(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    if (!playing) return;
    if (tick >= maxTicks - 1) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(
      () => setTick((t) => Math.min(t + 1, maxTicks - 1)),
      speedToDelay(speed)
    );
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [playing, tick, maxTicks, speed]);

  const reset = (nextArray?: number[]) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setPlaying(false);
    setTick(-1);
    if (nextArray) setArray(nextArray);
  };

  const toggle = (id: AlgorithmId) => {
    reset();
    setSelected((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((x) => x !== id)
          : prev
        : [...prev, id]
    );
  };

  const finals = runs.map((run) => {
    const last = run.steps[run.steps.length - 1];
    return {
      id: run.algorithm.id,
      name: run.algorithm.name,
      comparisons: last?.comparisons ?? 0,
      swaps: last?.swaps ?? 0,
      steps: run.steps.length,
      complexity: run.algorithm.complexity,
    };
  });

  const fewestComparisons = Math.min(...finals.map((f) => f.comparisons));
  const fewestSwaps = Math.min(...finals.map((f) => f.swaps));

  // Finish order: fewer recorded steps = the algorithm finishes earlier in the
  // race animation, so ranking is deterministic for a fixed array.
  const byStepsAsc = [...finals].sort((a, b) => a.steps - b.steps);
  const rankById = new Map<string, number>(byStepsAsc.map((f, i) => [f.id, i + 1]));
  const winner = byStepsAsc[0] ?? null;
  const raceOver = tick >= 0 && tick >= maxTicks - 1;

  // Live standings: who is furthest along the tape right now.
  const liveStandings = runs
    .map((run) => {
      const last = run.steps.length - 1;
      return {
        id: run.algorithm.id,
        name: run.algorithm.name,
        at: Math.min(tick, last),
        progress: run.steps.length > 0 ? ((Math.min(tick, last) + 1) / run.steps.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.progress - a.progress);

  const finishChip = (id: AlgorithmId, steps: number) => {
    const rank = rankById.get(id) ?? 0;
    if (rank === 1) {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
          <Crown className="h-3 w-3" />
          {ordinal(rank)} · {steps}
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-ink">
          <Medal className="h-3 w-3" />
          {ordinal(rank)} · {steps}
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-orange-500/50 bg-orange-500/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-orange-600 dark:text-orange-300">
          <Medal className="h-3 w-3" />
          {ordinal(rank)} · {steps}
        </span>
      );
    }
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-sky-600 dark:text-sky-300">
        <Flag className="h-3 w-3" />
        {ordinal(rank)} · {steps}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="overline text-muted">Compare</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Algorithm comparison
        </h1>
        <p className="mt-1.5 text-sm text-ink">
          Run several algorithms on the <strong>same array</strong> and watch which one
          finishes first — and at what cost.
        </p>
      </header>

      {/* Setup */}
      <Panel dots={false} title="RACE SETUP" className="mb-6">
        <div className="space-y-5 p-4">
          <div>
            <p className="overline mb-2 text-muted">
              Algorithms ({selected.length} selected)
            </p>
            <div className="flex flex-wrap gap-2">
              {algorithmList.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => toggle(algo.id)}
                  aria-pressed={selected.includes(algo.id)}
                  className={cn(
                    "min-h-[36px] shrink-0 rounded-md border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    selected.includes(algo.id)
                      ? "border-brand-500 bg-brand-500 text-[#04201d]"
                      : "border-line text-ink hover:bg-surface-2 hover:text-fg"
                  )}
                >
                  {algo.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <Slider
              label="Array size"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={size}
              onChange={(v) => {
                setSize(v);
                reset(randomArray(v));
              }}
              valueLabel={`${size} bars`}
            />
            <Slider
              label="Speed"
              min={1}
              max={100}
              value={speed}
              onChange={setSpeed}
              valueLabel={`${speedToDelay(speed)} ms/step`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                  return;
                }
                if (tick >= maxTicks - 1) setTick(-1);
                setPlaying(true);
              }}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Race"}
            </Button>
            <Button variant="secondary" onClick={() => reset()}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={() => reset(randomArray(size))}>
              <Shuffle className="h-4 w-4" />
              New array
            </Button>
            <div className="inline-flex items-center rounded-md border border-line bg-surface-2 p-0.5">
              {(
                [
                  { key: "asc", Icon: ArrowUpNarrowWide, label: "Asc" },
                  { key: "desc", Icon: ArrowDownNarrowWide, label: "Desc" },
                ] as { key: SortOrder; Icon: typeof ArrowUpNarrowWide; label: string }[]
              ).map(({ key, Icon, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    reset();
                    setOrder(key);
                  }}
                  aria-pressed={order === key}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                    order === key
                      ? "bg-brand-500 text-[#04201d]"
                      : "text-ink hover:text-fg"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <span className="w-full shrink-0 font-mono text-xs text-muted sm:ml-auto sm:w-auto">
              tick {tick + 1} / {maxTicks}
            </span>
          </div>
        </div>
      </Panel>

      {/* Live standings tape */}
      {tick >= 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-4 border-b border-line px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Live standings
            </span>
            <span className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
              {liveStandings.map((l, i) => (
                <span
                  key={l.id}
                  className="flex items-center gap-1.5 font-mono text-[11px]"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded text-[9px]",
                      i === 0
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-300"
                        : "bg-surface-2 text-muted"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-ink">{l.name}</span>
                  <span className="tabular-nums text-muted">
                    {Math.round(l.progress)}%
                  </span>
                </span>
              ))}
            </span>
          </div>
        </Card>
      )}

      {/* Lanes */}
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        {runs.map((run, i) => {
          const idx = Math.min(tick, run.steps.length - 1);
          const step = idx >= 0 ? run.steps[idx] : null;
          const done = tick >= run.steps.length - 1 && tick >= 0;
          const progress = run.steps.length > 0 ? ((idx + 1) / run.steps.length) * 100 : 0;
          return (
            <Panel
              key={run.algorithm.id}
              dots={false}
              className={cn(
                done && run.algorithm.id === winner?.id &&
                  "border-amber-500/70 shadow-[0_0_0_1px_var(--color-amber-500),0_16px_48px_-24px_color-mix(in_oklab,var(--color-amber-500)_70%,transparent)]"
              )}
              title={`lane ${String(i + 1).padStart(2, "0")} · ${run.algorithm.name.toUpperCase()}`}
              action={done && finishChip(run.algorithm.id, run.steps.length)}
            >
              <div className="p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] text-muted">
                  <Complexity value={run.algorithm.complexity.average} size="xs" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    average
                  </span>
                </p>
                <MiniBars values={step ? step.array : array} step={step} />
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-[width] duration-150"
                    style={{ width: `${Math.max(progress, 0)}%` }}
                  />
                </div>
                <dl className="mt-2.5 grid min-w-0 grid-cols-3 divide-x divide-line rounded-md border border-line bg-surface-2/40 text-center font-mono text-[11px]">
                  {[
                    { label: "cmp", value: step?.comparisons ?? 0 },
                    { label: "mov", value: step?.swaps ?? 0 },
                    { label: "step", value: `${idx + 1}/${run.steps.length}` },
                  ].map((stat) => (
                    <div key={stat.label} className="min-w-0 truncate px-2 py-1.5">
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className="truncate">
                        <span className="text-muted">{stat.label} </span>
                        <span className="tabular-nums text-fg">{stat.value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Panel>
          );
        })}
      </div>

      <Card className="mt-6 min-w-0 max-w-full overflow-hidden">
        <CardHeader title="Final results on this exact array" />
        {/* Only this wrapper scrolls sideways — never the document. */}
        <ScrollableTable label="Algorithm comparison metrics">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">
              Final comparison, move and step counts for each selected algorithm on the
              current array, alongside their best-case, worst-case and space
              complexities and whether they are stable.
            </caption>
            <thead className="bg-surface-2/60 text-left font-mono text-[10px] uppercase tracking-widest text-muted">
              <tr>
                {[
                  "Algorithm",
                  "Comparisons",
                  "Moves",
                  "Steps",
                  "Finish",
                  "Best",
                  "Worst",
                  "Space",
                  "Stable",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap px-4 py-2.5 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finals.map((f) => {
                const rank = rankById.get(f.id) ?? 0;
                const isWinner = rank === 1;
                return (
                  <tr
                    key={f.id}
                    className={cn(
                      "border-t border-line",
                      isWinner && "bg-amber-500/[0.06] dark:bg-amber-500/10"
                    )}
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-2 text-left font-medium"
                    >
                      {f.name}
                    </th>
                    <td
                      className={cn(
                        "px-4 py-2 font-mono tabular-nums",
                        f.comparisons === fewestComparisons &&
                          "font-bold text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {f.comparisons}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-mono tabular-nums",
                        f.swaps === fewestSwaps &&
                          "font-bold text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {f.swaps}
                    </td>
                    <td className="px-4 py-2 font-mono tabular-nums">{f.steps}</td>
                    <td
                      className={cn(
                        "px-4 py-2 font-mono tabular-nums",
                        isWinner && "font-bold text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {ordinal(rank)}
                    </td>
                    <td className="px-4 py-2">
                      <Complexity value={f.complexity.best} size="xs" />
                    </td>
                    <td className="px-4 py-2">
                      <Complexity value={f.complexity.worst} size="xs" />
                    </td>
                    <td className="px-4 py-2">
                      <Complexity value={f.complexity.space} size="xs" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">{f.complexity.stable ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollableTable>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          Green values mark the lowest count for this input. “Moves” counts swaps plus
          array writes, so merge sort — which copies values rather than swapping — is
          measured fairly against in-place sorts. “Finish” ranks who completed the
          race first (fewest steps); the amber row is the overall winner.
        </p>
        {raceOver && winner && (
          <p className="border-t border-line px-4 py-3 text-xs text-ink">
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              <Crown className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
              {winner.name} won the race in {winner.steps} steps
            </span>
            {finals
              .filter((f) => f.id !== winner.id)
              .map((f) => {
                const delta = f.steps / winner.steps;
                return (
                  <span key={f.id} className="mx-1.5">
                    · {f.name} {delta >= 1.05 ? `${delta.toFixed(1)}× more steps` : "matched"}
                  </span>
                );
              })}
            .
          </p>
        )}
      </Card>
    </div>
  );
}