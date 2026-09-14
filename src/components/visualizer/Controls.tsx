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
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={togglePlay}
        size="md"
        className="min-w-[104px] justify-center"
        aria-label={isPlaying ? "Pause animation" : "Play animation"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {isPlaying ? "Pause" : isFinished ? "Replay" : "Play"}
      </Button>

      <Button
        variant="outline"
        onClick={previous}
        disabled={stepIndex < 0}
        aria-label="Previous step"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <Button
        variant="outline"
        onClick={next}
        disabled={isFinished || totalSteps === 0}
        aria-label="Next step"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="outline" onClick={replay} aria-label="Replay from the start">
        <RotateCw className="h-4 w-4" />
        Replay
      </Button>

      <Button
        variant="outline"
        onClick={skipToEnd}
        disabled={isFinished}
        aria-label="Skip to the end"
      >
        <SkipForward className="h-4 w-4" />
        Skip to end
      </Button>

      <Button variant="secondary" onClick={reset} aria-label="Reset the visualizer">
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
