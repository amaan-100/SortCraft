import { StepRecorder } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure mergeSort(A, lo, hi)",
  "  if lo ≥ hi then return",
  "  mid ← (lo + hi) / 2",
  "  mergeSort(A, lo, mid)",
  "  mergeSort(A, mid + 1, hi)",
  "  merge(A, lo, mid, hi)",
  "procedure merge(A, lo, mid, hi)",
  "  L ← A[lo..mid]; R ← A[mid+1..hi]",
  "  while L and R both non-empty do",
  "    if L[i] ≤ R[j] then A[k] ← L[i++]",
  "    else A[k] ← R[j++]",
  "  copy any remaining elements back",
  "end procedure",
];

const javaCode = `public class MergeSort {

    public static void sort(int[] a) {
        mergeSort(a, 0, a.length - 1);
    }

    private static void mergeSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        mergeSort(a, lo, mid);
        mergeSort(a, mid + 1, hi);
        merge(a, lo, mid, hi);
    }

    private static void merge(int[] a, int lo, int mid, int hi) {
        int[] left  = java.util.Arrays.copyOfRange(a, lo, mid + 1);
        int[] right = java.util.Arrays.copyOfRange(a, mid + 1, hi + 1);
        int i = 0, j = 0, k = lo;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) a[k++] = left[i++];
            else                     a[k++] = right[j++];
        }
        while (i < left.length)  a[k++] = left[i++];
        while (j < right.length) a[k++] = right[j++];
    }
}`;

const range = (lo: number, hi: number): number[] =>
  Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

function generateSteps(input: number[], order: SortOrder): SortStep[] {
  const rec = new StepRecorder(input);
  const a = rec.array;
  const n = a.length;

  if (n <= 1) {
    rec.markAllSorted();
    rec.record({
      action: "COMPLETE",
      explanation: "The array has fewer than two elements, so it is already sorted.",
      pseudocodeLine: 12,
      phase: "Complete",
    });
    return rec.result();
  }

  const merge = (lo: number, mid: number, hi: number, depth: number) => {
    const phase = `Merge level ${depth} · [${lo}…${hi}]`;
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    const window = range(lo, hi);

    rec.record({
      action: "COMPARE",
      indices: [],
      explanation: `Merging the sorted halves [${lo}…${mid}] and [${mid + 1}…${hi}] back together.`,
      pseudocodeLine: 7,
      phase,
      selected: window,
    });

    let i = 0;
    let j = 0;
    let k = lo;

    while (i < left.length && j < right.length) {
      rec.countComparison();
      rec.record({
        action: "COMPARE",
        indices: [lo + i, mid + 1 + j],
        explanation: `Comparing ${left[i]} from the left half with ${right[j]} from the right half.`,
        pseudocodeLine: 8,
        phase,
        selected: window,
      });

      const takeLeft = !StepRecorder.isBefore(right[j], left[i], order);
      const value = takeLeft ? left[i] : right[j];
      rec.countSwap();
      rec.write(k, value);
      rec.record({
        action: "OVERWRITE",
        indices: [k],
        explanation: `Writing ${value} from the ${takeLeft ? "left" : "right"} half into position ${k}.`,
        pseudocodeLine: takeLeft ? 9 : 10,
        phase,
        selected: window,
      });
      if (takeLeft) i += 1;
      else j += 1;
      k += 1;
    }

    while (i < left.length) {
      const value = left[i];
      rec.countSwap();
      rec.write(k, value);
      rec.record({
        action: "OVERWRITE",
        indices: [k],
        explanation: `Copying the remaining left-half value ${value} into position ${k}.`,
        pseudocodeLine: 11,
        phase,
        selected: window,
      });
      i += 1;
      k += 1;
    }

    while (j < right.length) {
      const value = right[j];
      rec.countSwap();
      rec.write(k, value);
      rec.record({
        action: "OVERWRITE",
        indices: [k],
        explanation: `Copying the remaining right-half value ${value} into position ${k}.`,
        pseudocodeLine: 11,
        phase,
        selected: window,
      });
      j += 1;
      k += 1;
    }

    if (lo === 0 && hi === n - 1) {
      rec.markAllSorted();
    }
    rec.record({
      action: "MARK_SORTED",
      indices: window,
      explanation: `The sub-array [${lo}…${hi}] is now fully merged and sorted.`,
      pseudocodeLine: 5,
      phase,
      selected: lo === 0 && hi === n - 1 ? [] : window,
    });
  };

  const sort = (lo: number, hi: number, depth: number) => {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    rec.record({
      action: "COMPARE",
      indices: [],
      explanation: `Splitting [${lo}…${hi}] at index ${mid} into two halves (divide step).`,
      pseudocodeLine: 2,
      phase: `Split level ${depth} · [${lo}…${hi}]`,
      selected: range(lo, hi),
    });
    sort(lo, mid, depth + 1);
    sort(mid + 1, hi, depth + 1);
    merge(lo, mid, hi, depth);
  };

  sort(0, n - 1, 1);

  rec.markAllSorted();
  rec.record({
    action: "COMPLETE",
    indices: [],
    explanation: "Sorting complete — every element is in its correct position.",
    pseudocodeLine: 12,
    phase: "Complete",
  });

  return rec.result();
}

export const mergeSort: Algorithm = {
  id: "merge",
  name: "Merge Sort",
  family: "advanced",
  tagline: "Divide the array in half, sort each half, then merge them.",
  description:
    "Merge sort is the classic divide-and-conquer sort. It recursively halves the array until each piece holds a single element, then merges neighbouring pieces back together in order. The merge step is linear and the recursion is logarithmic, giving a guaranteed O(n log n) — but it needs O(n) extra space for the temporary halves.",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
  },
  pseudocode,
  javaCode,
  generateSteps,
};
