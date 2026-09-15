import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAlgorithm } from "@/algorithms";
import type { AlgorithmId, SortOrder, SortStep } from "@/algorithms/types";
import { randomArray } from "@/utils/array";
import { detectJavaBackend, fetchSortSteps } from "@/lib/api";

export type EngineSource = "java" | "browser";

export interface SortPlayerState {
  algorithmId: AlgorithmId;
  order: SortOrder;
  baseArray: number[];
  steps: SortStep[];
  stepIndex: number; // -1 => untouched initial state
  isPlaying: boolean;
  speed: number; // 1 (slow) .. 100 (fast)
}

export const speedToDelay = (speed: number): number =>
  Math.max(5, Math.round(505 - speed * 5));

/**
 * Owns *all* animation state for the visualizer.
 * Completely independent from authentication state.
 */
export function useSortPlayer(initialSize = 24, initialAlgorithm: AlgorithmId = "bubble") {
  const [algorithmId, setAlgorithmId] = useState<AlgorithmId>(initialAlgorithm);
  const [order, setOrder] = useState<SortOrder>("asc");
  const [baseArray, setBaseArray] = useState<number[]>(() => randomArray(initialSize));
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [javaSteps, setJavaSteps] = useState<SortStep[] | null>(null);
  const [engine, setEngine] = useState<EngineSource>("browser");

  const timerRef = useRef<number | null>(null);

  const algorithm = useMemo(() => getAlgorithm(algorithmId), [algorithmId]);

  const localSteps = useMemo(
    () => algorithm.generateSteps(baseArray, order),
    [algorithm, baseArray, order]
  );

  /**
   * Sorting runs on the Java backend when it is reachable and falls back to
   * the identical in-browser engine otherwise. A config change re-fetches.
   */
  useEffect(() => {
    let cancelled = false;
    setJavaSteps(null);
    setEngine("browser");

    detectJavaBackend().then((available) => {
      if (!available || cancelled) return;
      fetchSortSteps(baseArray, algorithmId, order).then((remote) => {
        if (cancelled || !remote || remote.length === 0) return;
        setJavaSteps(remote);
        setEngine("java");
      });
    });

    return () => {
      cancelled = true;
    };
  }, [baseArray, algorithmId, order, localSteps.length]);

  const steps = javaSteps ?? localSteps;

  const totalSteps = steps.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Single playback timer — guarantees only one animation runs at a time. */
  useEffect(() => {
    clearTimer();
    if (!isPlaying) return;
    if (stepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
    }, speedToDelay(speed));
    return clearTimer;
  }, [isPlaying, stepIndex, totalSteps, speed, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  /** Any configuration change cancels the running animation. */
  const hardReset = useCallback(
    (nextArray?: number[]) => {
      clearTimer();
      setIsPlaying(false);
      setStepIndex(-1);
      if (nextArray) setBaseArray(nextArray);
    },
    [clearTimer]
  );

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    if (stepIndex >= totalSteps - 1) setStepIndex(-1);
    setIsPlaying(true);
  }, [stepIndex, totalSteps]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const next = useCallback(() => {
    pause();
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [pause, totalSteps]);

  const previous = useCallback(() => {
    pause();
    setStepIndex((i) => Math.max(i - 1, -1));
  }, [pause]);

  const reset = useCallback(() => hardReset(), [hardReset]);

  const replay = useCallback(() => {
    clearTimer();
    setStepIndex(-1);
    setIsPlaying(true);
  }, [clearTimer]);

  const skipToEnd = useCallback(() => {
    pause();
    setStepIndex(totalSteps - 1);
  }, [pause, totalSteps]);

  const goToStep = useCallback(
    (index: number) => {
      pause();
      setStepIndex(Math.min(Math.max(index, -1), totalSteps - 1));
    },
    [pause, totalSteps]
  );

  const shuffle = useCallback(
    (size?: number) => hardReset(randomArray(size ?? baseArray.length)),
    [baseArray.length, hardReset]
  );

  const applyCustomArray = useCallback(
    (values: number[]) => hardReset(values),
    [hardReset]
  );

  const changeAlgorithm = useCallback(
    (id: AlgorithmId) => {
      clearTimer();
      setIsPlaying(false);
      setStepIndex(-1);
      setAlgorithmId(id);
    },
    [clearTimer]
  );

  const changeOrder = useCallback(
    (nextOrder: SortOrder) => {
      clearTimer();
      setIsPlaying(false);
      setStepIndex(-1);
      setOrder(nextOrder);
    },
    [clearTimer]
  );

  const currentStep: SortStep | null = stepIndex >= 0 ? steps[stepIndex] ?? null : null;

  const displayArray = currentStep ? currentStep.array : baseArray;
  const isFinished = totalSteps > 0 && stepIndex === totalSteps - 1;

  return {
    // state
    algorithm,
    algorithmId,
    order,
    baseArray,
    steps,
    totalSteps,
    stepIndex,
    currentStep,
    displayArray,
    isPlaying,
    isFinished,
    speed,
    engine,
    // setters / controls
    setSpeed,
    changeAlgorithm,
    changeOrder,
    play,
    pause,
    togglePlay,
    next,
    previous,
    reset,
    replay,
    skipToEnd,
    goToStep,
    shuffle,
    applyCustomArray,
  };
}

export type SortPlayer = ReturnType<typeof useSortPlayer>;
