import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SortPlayer } from "@/hooks/useSortPlayer";

/** Transport deck — one clear primary action plus icon controls. */
export function Controls({ player }: { player: SortPlayer }) {
  const {
    isPlaying,
    stepIndex,
    totalSteps,
    togglePlay,
    next,
    previous,
    reset,
    replay,
    skipToEnd,
    isFinished,
  } = player;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-line bg-surface-2/40 px-4 py-3">
      <Button
        onClick={togglePlay}
        size="md"
        className="min-w-[108px] justify-center"
        aria-label={isPlaying ? "Pause animation" : "Play animation"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {isPlaying ? "Pause" : isFinished ? "Replay" : "Play"}
      </Button>

      <span className="mx-1.5 h-6 w-px shrink-0 bg-line" aria-hidden />

      <Button
        variant="outline"
        size="icon"
        onClick={previous}
        disabled={stepIndex < 0}
        aria-label="Previous step"
        title="Previous step"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={next}
        disabled={isFinished || totalSteps === 0}
        aria-label="Next step"
        title="Next step"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={replay}
        aria-label="Replay from the start"
        title="Replay from the start"
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={skipToEnd}
        disabled={isFinished}
        aria-label="Skip to the end"
        title="Skip to the end"
      >
        <SkipForward className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={reset}
        aria-label="Reset the visualizer"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}