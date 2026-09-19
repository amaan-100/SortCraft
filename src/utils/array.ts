export const MIN_SIZE = 5;
export const MAX_SIZE = 80;
export const MIN_VALUE = 5;
export const MAX_VALUE = 100;

export function randomArray(size: number): number[] {
  const clamped = Math.min(Math.max(size, MIN_SIZE), MAX_SIZE);
  return Array.from(
    { length: clamped },
    () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
}

export type ArrayPresetId =
  | "random"
  | "sorted"
  | "reversed"
  | "nearly-sorted"
  | "few-unique"
  | "sawtooth"
  | "mountain";

export const ARRAY_PRESETS: {
  id: ArrayPresetId;
  label: string;
  description: string;
}[] = [
  { id: "random", label: "Random", description: "A unique permutation — no duplicate bars, a mixed baseline." },
  { id: "sorted", label: "Sorted", description: "Already ordered: the best case for insertion sort." },
  { id: "reversed", label: "Reversed", description: "Fully backwards: the classic worst case." },
  { id: "nearly-sorted", label: "Nearly sorted", description: "Sorted with a handful of adjacent swaps — insertion shines." },
  { id: "few-unique", label: "Few distinct", description: "Only 8 distinct values shuffled — stresses stability and pivot choices." },
  { id: "sawtooth", label: "Sawtooth", description: "Alternates low/high across the range — a jagged adversarial shape." },
  { id: "mountain", label: "Mountain", description: "Ascends then descends — a bitonic shape that splits oddly under quicksort." },
];

/** Unique, evenly spaced plate of MIN_VALUE..MAX_VALUE, ascending. */
const sortedPlate = (n: number): number[] =>
  Array.from({ length: n }, (_, i) =>
    Math.round(MIN_VALUE + (i / Math.max(n - 1, 1)) * (MAX_VALUE - MIN_VALUE))
  );

const shuffled = (source: number[]): number[] => {
  const arr = [...source];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Builds an input shaped by the given preset, all within the valid value range. */
export function presetArray(size: number, preset: ArrayPresetId): number[] {
  const n = Math.min(Math.max(size, MIN_SIZE), MAX_SIZE);
  const plate = sortedPlate(n);

  switch (preset) {
    case "random":
      return shuffled(plate);
    case "sorted":
      return plate;
    case "reversed":
      return [...plate].reverse();
    case "nearly-sorted": {
      const arr = [...plate];
      const swaps = Math.max(1, Math.round(n / 10));
      for (let i = 0; i < swaps; i++) {
        const idx = Math.floor(Math.random() * (n - 1));
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      }
      return arr;
    }
    case "few-unique": {
      const distinct = Math.min(8, n);
      const pool = sortedPlate(distinct);
      return shuffled(Array.from({ length: n }, (_, i) => pool[i % distinct]));
    }
    case "sawtooth": {
      const half = Math.ceil(n / 2);
      const lows = plate.slice(0, half);
      const highs = plate.slice(half);
      return Array.from(
        { length: n },
        (_, i) => (i % 2 === 0 ? lows[i >> 1] : highs[i >> 1])
      );
    }
    case "mountain": {
      const half = Math.ceil(n / 2);
      return [...plate.slice(0, half), ...plate.slice(half).reverse()];
    }
  }
}

export interface ParseResult {
  ok: boolean;
  values: number[];
  error?: string;
}

/**
 * Validates a user supplied array such as "5, 3, 9 12".
 * Accepts commas, spaces, semicolons and newlines as separators.
 */
export function parseCustomArray(raw: string): ParseResult {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { ok: false, values: [], error: "Please enter at least one number." };
  }
  if (tokens.length < MIN_SIZE) {
    return {
      ok: false,
      values: [],
      error: `Enter at least ${MIN_SIZE} numbers (you entered ${tokens.length}).`,
    };
  }
  if (tokens.length > MAX_SIZE) {
    return {
      ok: false,
      values: [],
      error: `Enter at most ${MAX_SIZE} numbers (you entered ${tokens.length}).`,
    };
  }

  const values: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return {
        ok: false,
        values: [],
        error: `"${token}" is not a whole number. Use integers separated by commas or spaces.`,
      };
    }
    const value = Number(token);
    if (value < 1 || value > 999) {
      return {
        ok: false,
        values: [],
        error: `Values must be between 1 and 999 (found ${value}).`,
      };
    }
    values.push(value);
  }

  return { ok: true, values };
}

export const formatArray = (values: number[]): string => values.join(", ");
