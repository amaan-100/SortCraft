import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { isAlgorithmId } from "@/algorithms";
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

export default function VisualizerPage() {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("algo");
  const initialAlgorithm = requested && isAlgorithmId(requested) ? requested : "bubble";
  const player = useSortPlayer(24, initialAlgorithm);
  const lastRequested = useRef(initialAlgorithm);

  // Follow deep links such as /visualizer?algo=merge coming from a level page.
  useEffect(() => {
    if (requested && isAlgorithmId(requested) && requested !== lastRequested.current) {
      lastRequested.current = requested;
      player.changeAlgorithm(requested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, player]);

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
        <ConfigPanel player={player} />
        <ComplexityCard algorithm={algorithm} />
      </div>
    </div>
  );
}