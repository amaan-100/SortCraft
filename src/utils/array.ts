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
