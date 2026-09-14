import { StepRecorder } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure quickSort(A, lo, hi)",
  "  if lo ≥ hi then return",
  "  p ← partition(A, lo, hi)",
  "  quickSort(A, lo, p - 1)",
  "  quickSort(A, p + 1, hi)",
  "procedure partition(A, lo, hi)",
  "  pivot ← A[hi]; i ← lo - 1",
  "  for j ← lo to hi - 1 do",
  "    if A[j] ≤ pivot then",
  "      i ← i + 1; swap A[i], A[j]",
  "  swap A[i + 1], A[hi]",
  "  return i + 1",
];

const javaCode = `public class QuickSort {

    public static void sort(int[] a) {
        quickSort(a, 0, a.length - 1);
    }

    private static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }

    // Lomuto partition scheme, last element as pivot
    private static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            if (a[j] <= pivot) {
                i++;
                int tmp = a[i]; a[i] = a[j]; a[j] = tmp;
            }
        }
        int tmp = a[i + 1]; a[i + 1] = a[hi]; a[hi] = tmp;
        return i + 1;
    }
}`;

function generateSteps(input: number[], order: SortOrder): SortStep[] {
  const rec = new StepRecorder(input);
  const a = rec.array;
  const n = a.length;

  if (n <= 1) {
    rec.markAllSorted();
    rec.record({
      action: "COMPLETE",
      explanation: "The array has fewer than two elements, so it is already sorted.",
      pseudocodeLine: 11,
      phase: "Complete",
    });
    return rec.result();
  }

  const partition = (lo: number, hi: number, depth: number): number => {
    const phase = `Partition depth ${depth} · [${lo}…${hi}]`;
    const pivot = a[hi];

    rec.record({
      action: "PIVOT",
      indices: [hi],
      explanation: `Choosing ${pivot} at position ${hi} as the pivot for the range [${lo}…${hi}].`,
      pseudocodeLine: 6,
      phase,
      selected: [hi],
    });

    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      rec.countComparison();
      rec.record({
        action: "COMPARE",
        indices: [j, hi],
        explanation: `Comparing ${a[j]} at position ${j} with the pivot ${pivot}.`,
        pseudocodeLine: 8,
        phase,
        selected: [hi],
      });

      // "belongs on the pivot's left" depends on the requested order
      const belongsLeft = !StepRecorder.isBefore(pivot, a[j], order);
      if (belongsLeft) {
        i += 1;
        if (i !== j) {
          const left = a[i];
          const right = a[j];
          rec.countSwap();
          rec.swap(i, j);
          rec.record({
            action: "SWAP",
            indices: [i, j],
            explanation: `Swapping ${left} and ${right} to move ${right} into the left partition.`,
            pseudocodeLine: 9,
            phase,
            selected: [hi],
          });
        } else {
          rec.record({
            action: "COMPARE",
            indices: [i],
            explanation: `${a[i]} is already on the correct side of the pivot — no swap needed.`,
            pseudocodeLine: 9,
            phase,
            selected: [hi],
          });
        }
      }
    }

    const pivotIndex = i + 1;
    if (pivotIndex !== hi) {
      rec.countSwap();
      rec.swap(pivotIndex, hi);
      rec.record({
        action: "SWAP",
        indices: [pivotIndex, hi],
        explanation: `Placing the pivot ${pivot} at position ${pivotIndex}, between the two partitions.`,
        pseudocodeLine: 10,
        phase,
        selected: [pivotIndex],
      });
    }

    rec.markSorted(pivotIndex);
    rec.record({
      action: "MARK_SORTED",
      indices: [pivotIndex],
      explanation: `The pivot ${a[pivotIndex]} is now in its correct position and never moves again.`,
      pseudocodeLine: 11,
      phase,
    });

    return pivotIndex;
  };

  const sort = (lo: number, hi: number, depth: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      rec.markSorted(lo);
      rec.record({
        action: "MARK_SORTED",
        indices: [lo],
        explanation: `A single-element range [${lo}] is already sorted.`,
        pseudocodeLine: 1,
        phase: `Partition depth ${depth} · [${lo}…${hi}]`,
      });
      return;
    }
    const p = partition(lo, hi, depth);
    sort(lo, p - 1, depth + 1);
    sort(p + 1, hi, depth + 1);
  };

  sort(0, n - 1, 1);

  rec.markAllSorted();
  rec.record({
    action: "COMPLETE",
    indices: [],
    explanation: "Sorting complete — every element is in its correct position.",
    pseudocodeLine: 11,
    phase: "Complete",
  });

  return rec.result();
}

export const quickSort: Algorithm = {
  id: "quick",
  name: "Quick Sort",
  family: "advanced",
  tagline: "Partition around a pivot, then sort both sides.",
  description:
    "Quick sort picks a pivot and rearranges the array so everything smaller sits left of it and everything larger sits right. The pivot is then permanently in place and the two sides are sorted recursively. This visualization uses the Lomuto scheme with the last element as pivot — fast in practice, but O(n²) if the pivot choice is consistently poor.",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
  },
  pseudocode,
  javaCode,
  generateSteps,
};
