import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { isAlgorithmId } from "@/algorithms";
import { useSortPlayer } from "@/hooks/useSortPlayer";
import { BarChart } from "@/components/visualizer/BarChart";
import { CodePanel } from "@/components/visualizer/CodePanel";
import { ComplexityCard } from "@/components/visualizer/ComplexityCard";
import { ConfigPanel } from "@/components/visualizer/ConfigPanel";
import { Controls } from "@/components/visualizer/Controls";
import { ExplanationPanel } from "@/components/visualizer/ExplanationPanel";
import { Legend } from "@/components/visualizer/Legend";
import { StatsBar } from "@/components/visualizer/StatsBar";
import { Card } from "@/components/ui/Card";

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
  } = player;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {algorithm.name} visualizer
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              engine === "java"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                engine === "java" ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {engine === "java" ? "Java engine" : "Browser engine"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {algorithm.tagline} Sorting in{" "}
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {order === "asc" ? "ascending" : "descending"}
          </span>{" "}
          order.
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card className="min-w-0 p-4">
            <BarChart values={displayArray} step={currentStep} />
            <div className="mt-4 space-y-4">
              <Controls player={player} />
              <StatsBar
                step={currentStep}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                onSeek={goToStep}
              />
              <Legend />
            </div>
          </Card>

          <ExplanationPanel step={currentStep} stepIndex={stepIndex} />
          <ConfigPanel player={player} />
          <ComplexityCard algorithm={algorithm} />
        </div>

        <div className="min-w-0 space-y-6">
          <CodePanel
            algorithm={algorithm}
            activeLine={currentStep ? currentStep.pseudocodeLine : null}
          />
        </div>
      </div>
    </div>
  );
}
