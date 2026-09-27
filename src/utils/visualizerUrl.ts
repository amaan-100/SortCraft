import { isAlgorithmId } from "@/algorithms";
import type { AlgorithmId, SortOrder } from "@/algorithms/types";
import { ARRAY_PRESETS, MAX_SIZE, MIN_SIZE, type ArrayPresetId } from "@/utils/array";

/**
 * The part of the visualizer configuration that is shareable through the URL.
 * The exact array values are intentionally excluded — the URL shares the input
 * *shape* and size, and a random preset may differ between visitors.
 */
export interface VisualizerUrlConfig {
  algo?: AlgorithmId;
  order?: SortOrder;
  n?: number;
  shape?: ArrayPresetId;
}

const isPresetId = (value: string): value is ArrayPresetId =>
  ARRAY_PRESETS.some((p) => p.id === value);

/** Parses and validates the visualizer query string, ignoring unknown values. */
export function parseVisualizerUrl(searchParams: URLSearchParams): VisualizerUrlConfig {
  const algo = searchParams.get("algo");
  const order = searchParams.get("order");
  const rawN = searchParams.get("n");
  const shape = searchParams.get("shape");

  return {
    algo: algo && isAlgorithmId(algo) ? algo : undefined,
    order: order === "asc" || order === "desc" ? order : undefined,
    n:
      rawN !== null && /^\d+$/.test(rawN)
        ? Math.min(Math.max(Number(rawN), MIN_SIZE), MAX_SIZE)
        : undefined,
    shape: shape && isPresetId(shape) ? shape : undefined,
  };
}