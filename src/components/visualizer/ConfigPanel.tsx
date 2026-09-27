import { useEffect, useRef, useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { algorithmList } from "@/algorithms";
import type { AlgorithmId, SortOrder } from "@/algorithms/types";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
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
import type { VisualizerUrlConfig } from "@/utils/visualizerUrl";
import { cn } from "@/utils/cn";

export function ConfigPanel({
  player,
  urlShape,
  onConfigChange,
}: {
  player: SortPlayer;
  urlShape?: ArrayPresetId;
  onConfigChange?: (config: VisualizerUrlConfig) => void;
}) {
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
  const [preset, setPreset] = useState<ArrayPresetId>(urlShape ?? "random");
  const [customText, setCustomText] = useState(() => formatArray(baseArray));
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSize(baseArray.length);
    setCustomText(formatArray(baseArray));
  }, [baseArray]);

  // Keep the active shape in sync when a shared URL changes it.
  useEffect(() => {
    if (urlShape) setPreset(urlShape);
  }, [urlShape]);

  // Report the shareable config so the URL stays in sync. Only fires when a
  // URL-relevant field actually changes; custom arrays with identical length
  // and shape don't trigger a rewrite.
  const lastReportedRef = useRef(
    `${algorithmId}|${order}|${baseArray.length}|${preset}`
  );
  useEffect(() => {
    const key = `${algorithmId}|${order}|${baseArray.length}|${preset}`;
    if (lastReportedRef.current === key) return;
    lastReportedRef.current = key;
    onConfigChange?.({
      algo: algorithmId,
      order,
      n: baseArray.length,
      shape: preset,
    });
  }, [algorithmId, order, baseArray, preset, onConfigChange]);

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
    <Panel dots={false} title="CONFIGURATION" bodyClassName="space-y-5 p-4">
        <div>
          <p className="overline mb-2 text-muted">Algorithm</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {algorithmList.map((algo) => (
              <button
                key={algo.id}
                onClick={() => changeAlgorithm(algo.id as AlgorithmId)}
                className={cn(
                  "min-w-0 rounded-md border px-3 py-2 text-left transition-colors",
                  algorithmId === algo.id
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-line hover:border-line-strong hover:bg-surface-2"
                )}
              >
                <span className="block truncate text-sm font-semibold text-fg">
                  {algo.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
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
          <div className="inline-flex items-center rounded-md border border-line bg-surface-2 p-0.5">
            {(
              [
                { key: "asc", label: "Ascending", Icon: ArrowUpNarrowWide },
                { key: "desc", label: "Descending", Icon: ArrowDownNarrowWide },
              ] as { key: SortOrder; label: string; Icon: typeof ArrowUpNarrowWide }[]
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => changeOrder(key)}
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
        </div>

        <div>
          <p className="overline mb-2 text-muted">Input shape</p>
          <div className="flex flex-wrap gap-2">
            {ARRAY_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                aria-pressed={preset === p.id}
                className={cn(
                  "min-h-[30px] rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                  preset === p.id
                    ? "border-brand-500 bg-brand-500 text-[#04201d]"
                    : "border-line text-ink hover:bg-surface-2"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
            {ARRAY_PRESETS.find((p) => p.id === preset)?.description}
          </p>
        </div>

        <div>
          <label
            htmlFor="custom-array"
            className="overline mb-1.5 block text-muted"
          >
            Custom array ({MIN_SIZE}–{MAX_SIZE} integers
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
                "flex-1 rounded-md border bg-canvas px-3 py-2 font-mono text-xs text-fg focus:outline-none focus:ring-2 focus:ring-brand-500/50",
                customError ? "border-rose-500" : "border-line"
              )}
            />
            <Button onClick={handleApplyCustom} className="sm:self-start">
              Use array
            </Button>
          </div>
          {customError && (
            <p className="mt-1.5 text-xs text-rose-500">
              {customError}
            </p>
          )}
          {customSuccess && (
            <p className="mt-1.5 text-xs text-emerald-500">
              {customSuccess}
            </p>
          )}
        </div>
    </Panel>
  );
}
