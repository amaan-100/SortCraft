import { bubbleSort } from "./bubbleSort";
import { heapSort } from "./heapSort";
import { insertionSort } from "./insertionSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { selectionSort } from "./selectionSort";
import { shellSort } from "./shellSort";
import type { Algorithm, AlgorithmId } from "./types";

export const algorithms: Record<AlgorithmId, Algorithm> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  shell: shellSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
};

export const algorithmList: Algorithm[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  mergeSort,
  quickSort,
  heapSort,
];

export const algorithmIds = algorithmList.map((a) => a.id);

export const getAlgorithm = (id: AlgorithmId): Algorithm => algorithms[id];

export const isAlgorithmId = (value: string): value is AlgorithmId =>
  Object.prototype.hasOwnProperty.call(algorithms, value);

/** Final metrics without replaying the animation — used by the comparison page. */
export function summarise(
  id: AlgorithmId,
  input: number[],
  order: "asc" | "desc"
): { comparisons: number; swaps: number; steps: number; sorted: number[] } {
  const steps = algorithms[id].generateSteps(input, order);
  const last = steps[steps.length - 1];
  return {
    comparisons: last?.comparisons ?? 0,
    swaps: last?.swaps ?? 0,
    steps: steps.length,
    sorted: last?.array ?? [...input],
  };
}

export * from "./types";
export { StepRecorder } from "./stepRecorder";
