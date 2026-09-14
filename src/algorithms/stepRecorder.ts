import type { ActionType, SortOrder, SortStep } from "./types";

export interface RecordOptions {
  action: ActionType;
  indices?: number[];
  explanation: string;
  pseudocodeLine: number;
  phase: string;
  selected?: number[];
}

/**
 * Shared recorder used by every algorithm so that step bookkeeping
 * (snapshots, counters, sorted set) is never duplicated.
 */
export class StepRecorder {
  readonly array: number[];
  private steps: SortStep[] = [];
  private sorted = new Set<number>();
  comparisons = 0;
  swaps = 0;

  constructor(input: number[]) {
    this.array = [...input];
  }

  /** Comparison helper honouring the requested sort order. */
  static shouldSwap(a: number, b: number, order: SortOrder): boolean {
    return order === "asc" ? a > b : a < b;
  }

  static isBefore(a: number, b: number, order: SortOrder): boolean {
    return order === "asc" ? a < b : a > b;
  }

  countComparison(): void {
    this.comparisons += 1;
  }

  countSwap(): void {
    this.swaps += 1;
  }

  markSorted(index: number): void {
    this.sorted.add(index);
  }

  markAllSorted(): void {
    this.array.forEach((_, i) => this.sorted.add(i));
  }

  swap(i: number, j: number): void {
    const tmp = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = tmp;
  }

  write(index: number, value: number): void {
    this.array[index] = value;
  }

  record(options: RecordOptions): void {
    this.steps.push({
      action: options.action,
      array: [...this.array],
      indices: options.indices ?? [],
      explanation: options.explanation,
      pseudocodeLine: options.pseudocodeLine,
      comparisons: this.comparisons,
      swaps: this.swaps,
      phase: options.phase,
      sortedIndices: [...this.sorted].sort((a, b) => a - b),
      selectedIndices: options.selected ?? [],
    });
  }

  result(): SortStep[] {
    return this.steps;
  }
}

export const ordinalPhase = (pass: number, total: number): string =>
  `Pass ${pass} of ${total}`;
