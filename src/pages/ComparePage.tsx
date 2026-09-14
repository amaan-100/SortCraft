import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Crown,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SplitSquareHorizontal,
} from "lucide-react";
import { algorithmList, algorithms } from "@/algorithms";
import type { AlgorithmId, SortOrder } from "@/algorithms/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Complexity } from "@/components/ui/Complexity";
import { ScrollableTable } from "@/components/ui/ScrollableTable";
import { Slider } from "@/components/ui/Slider";
import { MiniBars } from "@/components/visualizer/MiniBars";
import { speedToDelay } from "@/hooks/useSortPlayer";
import { useProgress } from "@/context/ProgressContext";
import { MAX_SIZE, MIN_SIZE, randomArray } from "@/utils/array";
import { cn } from "@/utils/cn";

const DEFAULT_SELECTION: AlgorithmId[] = ["bubble", "insertion", "merge", "quick"];

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

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Algorithm comparison
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Run several algorithms on the <strong>same array</strong> and watch which one
          finishes first — and at what cost.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader
          title="Setup"
          icon={
            <SplitSquareHorizontal className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          }
        />
        <div className="space-y-5 p-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              Algorithms ({selected.length} selected)
            </p>
            <div className="flex flex-wrap gap-2">
              {algorithmList.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => toggle(algo.id)}
                  aria-pressed={selected.includes(algo.id)}
                  className={cn(
                    "min-h-[40px] shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                    selected.includes(algo.id)
                      ? "border-brand-500 bg-brand-600 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
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
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
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
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium",
                    order === key
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <span className="w-full shrink-0 font-mono text-xs text-slate-500 sm:ml-auto sm:w-auto">
              tick {tick + 1} / {maxTicks}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        {runs.map((run) => {
          const idx = Math.min(tick, run.steps.length - 1);
          const step = idx >= 0 ? run.steps[idx] : null;
          const done = tick >= run.steps.length - 1 && tick >= 0;
          const progress =
            run.steps.length > 0 ? ((idx + 1) / run.steps.length) * 100 : 0;
          return (
            <Card key={run.algorithm.id} className="min-w-0 p-4">
              <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
                <h2 className="min-w-0 truncate text-sm font-semibold">
                  {run.algorithm.name}
                </h2>
                {done && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Crown className="h-3 w-3" />
                    finished
                  </span>
                )}
              </div>
              <p className="mb-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Complexity value={run.algorithm.complexity.average} size="xs" />
                <span className="shrink-0">average</span>
              </p>
              <MiniBars values={step ? step.array : array} step={step} />
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-brand-500 transition-[width] duration-150"
                  style={{ width: `${Math.max(progress, 0)}%` }}
                />
              </div>
              <dl className="mt-2 grid min-w-0 grid-cols-3 gap-2 text-center font-mono text-[11px]">
                {[
                  { label: "cmp", value: step?.comparisons ?? 0 },
                  { label: "mov", value: step?.swaps ?? 0 },
                  { label: "step", value: `${idx + 1}/${run.steps.length}` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="min-w-0 truncate rounded bg-slate-100 py-1 dark:bg-slate-800/60"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="truncate">
                      {stat.label} {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
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
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                {[
                  "Algorithm",
                  "Comparisons",
                  "Moves",
                  "Steps",
                  "Best",
                  "Worst",
                  "Space",
                  "Stable",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap px-4 py-2 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finals.map((f) => (
                <tr key={f.id} className="border-t border-slate-200 dark:border-slate-800">
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
                  <td className="px-4 py-2">
                    <Complexity value={f.complexity.best} size="xs" />
                  </td>
                  <td className="px-4 py-2">
                    <Complexity value={f.complexity.worst} size="xs" />
                  </td>
                  <td className="px-4 py-2">
                    <Complexity value={f.complexity.space} size="xs" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {f.complexity.stable ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTable>
        <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          Green values mark the lowest count for this input. “Moves” counts swaps plus
          array writes, so merge sort — which copies values rather than swapping — is
          measured fairly against in-place sorts.
        </p>
      </Card>
    </div>
  );
}
