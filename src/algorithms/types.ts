/**
 * Core types for the SortCraft step engine.
 * Sorting logic is intentionally decoupled from any UI concern:
 * an algorithm is a pure function (input array + options) -> SortStep[]
 */

export type ActionType =
  | "COMPARE"
  | "SWAP"
  | "INSERT"
  | "SHIFT"
  | "OVERWRITE"
  | "PIVOT"
  | "MARK_SORTED"
  | "COMPLETE";

export type SortOrder = "asc" | "desc";

export type AlgorithmId =
  | "bubble"
  | "selection"
  | "insertion"
  | "shell"
  | "merge"
  | "quick"
  | "heap";

export type AlgorithmFamily = "quadratic" | "advanced";

export interface SortStep {
  /** What happened in this step */
  action: ActionType;
  /** Full snapshot of the array *after* the action was applied */
  array: number[];
  /** Indices directly involved in the action */
  indices: number[];
  /** Human readable explanation shown in the explanation panel */
  explanation: string;
  /** Zero-based pseudocode line to highlight */
  pseudocodeLine: number;
  /** Running comparison counter */
  comparisons: number;
  /** Running swap counter (swaps + writes that move data) */
  swaps: number;
  /** Coarse phase label, e.g. "Pass 1 of 7" */
  phase: string;
  /** Indices that are locked in their final position at this point */
  sortedIndices: number[];
  /** Indices highlighted as "selected"/pivot-ish (yellow) */
  selectedIndices: number[];
}

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
  inPlace: boolean;
}

export interface AlgorithmMeta {
  id: AlgorithmId;
  name: string;
  family: AlgorithmFamily;
  tagline: string;
  description: string;
  complexity: Complexity;
  pseudocode: string[];
  javaCode: string;
}

export type SortGenerator = (
  input: number[],
  order: SortOrder
) => SortStep[];

export interface Algorithm extends AlgorithmMeta {
  generateSteps: SortGenerator;
}
