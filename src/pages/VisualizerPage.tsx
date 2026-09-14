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
  } = player;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {algorithm.name} visualizer
        </h1>
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
