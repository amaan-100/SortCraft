import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSortPlayer } from "@/hooks/useSortPlayer";
import { Panel } from "@/components/ui/Panel";
import { BarChart } from "@/components/visualizer/BarChart";
import { CodePanel } from "@/components/visualizer/CodePanel";
import { ComplexityCard } from "@/components/visualizer/ComplexityCard";
import { ConfigPanel } from "@/components/visualizer/ConfigPanel";
import { Controls } from "@/components/visualizer/Controls";
import { ExplanationPanel } from "@/components/visualizer/ExplanationPanel";
import { Legend } from "@/components/visualizer/Legend";
import { StatsBar } from "@/components/visualizer/StatsBar";
import { presetArray, type ArrayPresetId } from "@/utils/array";
import {
  parseVisualizerUrl,
  type VisualizerUrlConfig,
} from "@/utils/visualizerUrl";

export default function VisualizerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Stable string form of the query so effects re-run only on real URL changes.
  const paramsStr = useMemo(() => searchParams.toString(), [searchParams]);
  const urlConfig = useMemo(
    () => parseVisualizerUrl(new URLSearchParams(paramsStr)),
    [paramsStr]
  );
  const initialAlgorithm = urlConfig.algo ?? "bubble";
  const player = useSortPlayer(24, initialAlgorithm);

  // The input shape the player currently holds, as reported by ConfigPanel.
  const playerShapeRef = useRef<ArrayPresetId | null>(null);

  // Follow the URL: pick up the fields it carries and leave anything else alone.
  // The array is rebuilt only when the incoming shape or size actually differs,
  // so a round-trip sync of our own changes never resets the current array.
  useEffect(() => {
    if (urlConfig.algo && urlConfig.algo !== player.algorithmId) {
      player.changeAlgorithm(urlConfig.algo);
    }
    if (urlConfig.order && urlConfig.order !== player.order) {
      player.changeOrder(urlConfig.order);
    }
    if (urlConfig.n !== undefined || urlConfig.shape !== undefined) {
      const shape = urlConfig.shape ?? playerShapeRef.current ?? "random";
      const sizeMismatch =
        urlConfig.n !== undefined && urlConfig.n !== player.baseArray.length;
      if (sizeMismatch || shape !== playerShapeRef.current) {
        player.applyCustomArray(
          presetArray(urlConfig.n ?? player.baseArray.length, shape)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsStr]);

  // Push the current shareable configuration back into the URL.
  const syncUrl = useCallback(
    (config: VisualizerUrlConfig) => {
      playerShapeRef.current = config.shape ?? "random";
      const next = new URLSearchParams();
      if (config.algo) next.set("algo", config.algo);
      if (config.order) next.set("order", config.order);
      if (config.n !== undefined) next.set("n", String(config.n));
      if (config.shape) next.set("shape", config.shape);
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  const {
    algorithm,
    displayArray,
    currentStep,
    stepIndex,
    totalSteps,
    goToStep,
    order,
    engine,
    baseArray,
  } = player;

  const stageTitle = `${algorithm.name.toLowerCase()}.sort — ${
    order === "asc" ? "ascending" : "descending"
  } — n = ${baseArray.length}`;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="overline text-muted">Visualizer</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {algorithm.name}
          </h1>
          <span
            title={
              engine === "java"
                ? "Current run is computed by the JVM service"
                : "Current run is computed in the browser"
            }
            className="inline-flex items-center gap-1.5 rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                engine === "java" ? "bg-brand-500" : "bg-muted"
              }`}
            />
            {engine === "java" ? "JVM" : "browser"}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-ink">
          {algorithm.tagline} Sorting in{" "}
          <span className="font-medium text-fg">
            {order === "asc" ? "ascending" : "descending"}
          </span>{" "}
          order.
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Stage — the instrument */}
        <div className="min-w-0 space-y-6">
          <Panel
            title={stageTitle}
            dots
            action={
              <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted">
                {currentStep?.phase ?? "ready"}
              </span>
            }
          >
            <BarChart values={displayArray} step={currentStep} />
            <StatsBar
              step={currentStep}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              onSeek={goToStep}
            />
            <Controls player={player} />
            <Legend />
          </Panel>
        </div>

        {/* Tool rail — read the code first, follow the current operation */}
        <div className="min-w-0 space-y-6">
          <CodePanel
            algorithm={algorithm}
            activeLine={currentStep ? currentStep.pseudocodeLine : null}
          />
          <ExplanationPanel step={currentStep} stepIndex={stepIndex} />
        </div>
      </div>

      {/* Instrument deck — below the stage */}
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ConfigPanel
          player={player}
          urlShape={urlConfig.shape}
          onConfigChange={syncUrl}
        />
        <ComplexityCard algorithm={algorithm} />
      </div>
    </div>
  );
}