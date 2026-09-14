import { StepRecorder, ordinalPhase } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure selectionSort(A, n)",
  "  for i ← 0 to n - 2 do",
  "    best ← i",
  "    for j ← i + 1 to n - 1 do",
  "      if A[j] < A[best] then",
  "        best ← j",
  "    if best ≠ i then",
  "      swap A[i] and A[best]",
  "    mark A[i] as sorted",
  "end procedure",
];

const javaCode = `public class SelectionSort {

    public static void sort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            int best = i;
            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[best]) {
                    best = j;
                }
            }
            if (best != i) {
                int tmp = a[i];
                a[i] = a[best];
                a[best] = tmp;
            }
            // a[i] now holds the smallest remaining value
        }
    }
}`;

function generateSteps(input: number[], order: SortOrder): SortStep[] {
  const rec = new StepRecorder(input);
  const a = rec.array;
  const n = a.length;
  const totalPasses = Math.max(n - 1, 1);
  const keyword = order === "asc" ? "smallest" : "largest";

  if (n <= 1) {
    rec.markAllSorted();
    rec.record({
      action: "COMPLETE",
      explanation: "The array has fewer than two elements, so it is already sorted.",
      pseudocodeLine: 9,
      phase: "Complete",
    });
    return rec.result();
  }

  for (let i = 0; i < n - 1; i++) {
    const phase = ordinalPhase(i + 1, totalPasses);
    let best = i;

    rec.record({
      action: "COMPARE",
      indices: [i],
      explanation: `Starting pass ${i + 1}: assume position ${i} holds the ${keyword} remaining value (${a[i]}).`,
      pseudocodeLine: 2,
      phase,
      selected: [best],
    });

    for (let j = i + 1; j < n; j++) {
      rec.countComparison();
      rec.record({
        action: "COMPARE",
        indices: [j, best],
        explanation: `Comparing elements at positions ${j} and ${best} (${a[j]} vs ${a[best]}).`,
        pseudocodeLine: 4,
        phase,
        selected: [best],
      });

      if (StepRecorder.isBefore(a[j], a[best], order)) {
        best = j;
        rec.record({
          action: "COMPARE",
          indices: [j],
          explanation: `New ${keyword} candidate found: ${a[j]} at position ${j}.`,
          pseudocodeLine: 5,
          phase,
          selected: [best],
        });
      }
    }

    if (best !== i) {
      const left = a[i];
      const right = a[best];
      rec.countSwap();
      rec.swap(i, best);
      rec.record({
        action: "SWAP",
        indices: [i, best],
        explanation: `Swapping ${left} and ${right} to move the ${keyword} remaining value into position ${i}.`,
        pseudocodeLine: 7,
        phase,
        selected: [i],
      });
    }

    rec.markSorted(i);
    rec.record({
      action: "MARK_SORTED",
      indices: [i],
      explanation: `The element ${a[i]} is now in its correct position. The current pass is complete.`,
      pseudocodeLine: 8,
      phase,
    });
  }

  rec.markAllSorted();
  rec.record({
    action: "COMPLETE",
    indices: [],
    explanation: "Sorting complete — every element is in its correct position.",
    pseudocodeLine: 9,
    phase: "Complete",
  });

  return rec.result();
}

export const selectionSort: Algorithm = {
  id: "selection",
  name: "Selection Sort",
  family: "quadratic",
  tagline: "Select the smallest remaining value and place it up front.",
  description:
    "Selection sort splits the array into a sorted prefix and an unsorted suffix. On every pass it scans the unsorted part to find the smallest (or largest) value, swaps it into the first unsorted slot and grows the sorted prefix by one. It always performs the same number of comparisons, but at most n − 1 swaps.",
  complexity: {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
  },
  pseudocode,
  javaCode,
  generateSteps,
};
