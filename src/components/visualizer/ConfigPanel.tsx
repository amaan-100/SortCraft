import { useEffect, useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Settings2 } from "lucide-react";
import { algorithmList } from "@/algorithms";
import type { AlgorithmId, SortOrder } from "@/algorithms/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Complexity } from "@/components/ui/Complexity";
import { Slider } from "@/components/ui/Slider";
import type { SortPlayer } from "@/hooks/useSortPlayer";
import { speedToDelay } from "@/hooks/useSortPlayer";
import {
  ARRAY_PRESETS,
  MAX_SIZE,
  MIN_SIZE,
  formatArray,
  parseCustomArray,
  presetArray,
  type ArrayPresetId,
} from "@/utils/array";
import { cn } from "@/utils/cn";

export function ConfigPanel({ player }: { player: SortPlayer }) {
  const {
    algorithmId,
    changeAlgorithm,
    order,
    changeOrder,
    baseArray,
    applyCustomArray,
    speed,
    setSpeed,
  } = player;

  const [size, setSize] = useState(baseArray.length);
  const [preset, setPreset] = useState<ArrayPresetId>("random");
  const [customText, setCustomText] = useState(() => formatArray(baseArray));
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSize(baseArray.length);
    setCustomText(formatArray(baseArray));
  }, [baseArray]);

  const handleSize = (value: number) => {
    setSize(value);
    applyCustomArray(presetArray(value, preset));
  };

  const handlePreset = (id: ArrayPresetId) => {
    setPreset(id);
    applyCustomArray(presetArray(size, id));
  };

  const handleApplyCustom = () => {
    const result = parseCustomArray(customText);
    if (!result.ok) {
      setCustomError(result.error ?? "Invalid input.");
      setCustomSuccess(null);
      return;
    }
    setCustomError(null);
    setCustomSuccess(`Loaded ${result.values.length} values.`);
    applyCustomArray(result.values);
  };

  return (
    <Card>
      <CardHeader
        title="Configuration"
        icon={<Settings2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
      />
      <div className="space-y-5 p-4">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            Algorithm
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {algorithmList.map((algo) => (
              <button
                key={algo.id}
                onClick={() => changeAlgorithm(algo.id as AlgorithmId)}
                className={cn(
                  "min-w-0 rounded-lg border px-3 py-2 text-left transition-colors",
                  algorithmId === algo.id
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                )}
              >
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {algo.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <Complexity
                    value={algo.complexity.average}
                    size="xs"
                    className="font-normal"
                  />
                  <span className="shrink-0">avg</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Slider
            label="Array size"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={size}
            onChange={handleSize}
            valueLabel={`${size} bars`}
            hint="Changing the size generates a new array with the active shape."
          />
          <Slider
            label="Animation speed"
            min={1}
            max={100}
            value={speed}
            onChange={setSpeed}
            valueLabel={`${speedToDelay(speed)} ms/step`}
            hint="Speed can be changed while the animation is running."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
            {(
              [
                { key: "asc", label: "Ascending", Icon: ArrowUpNarrowWide },
                { key: "desc", label: "Descending", Icon: ArrowDownNarrowWide },
              ] as { key: SortOrder; label: string; Icon: typeof ArrowUpNarrowWide }[]
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => changeOrder(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  order === key
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            Input shape
          </p>
          <div className="flex flex-wrap gap-2">
            {ARRAY_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                aria-pressed={preset === p.id}
                className={cn(
                  "min-h-[30px] rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  preset === p.id
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {ARRAY_PRESETS.find((p) => p.id === preset)?.description}
          </p>
        </div>

        <div>
          <label
            htmlFor="custom-array"
            className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Custom array ({MIN_SIZE}–{MAX_SIZE} integers between 1 and 999)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              id="custom-array"
              rows={2}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setCustomError(null);
                setCustomSuccess(null);
              }}
              placeholder="e.g. 42, 7, 19, 88, 3"
              className={cn(
                "flex-1 rounded-lg border bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-slate-950 dark:text-slate-100",
                customError
                  ? "border-rose-400 dark:border-rose-500"
                  : "border-slate-300 dark:border-slate-700"
              )}
            />
            <Button onClick={handleApplyCustom} className="sm:self-start">
              Use array
            </Button>
          </div>
          {customError && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
              {customError}
            </p>
          )}
          {customSuccess && (
            <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              {customSuccess}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
