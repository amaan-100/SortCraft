import { StepRecorder, ordinalPhase } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure bubbleSort(A, n)",
  "  for i ← 0 to n - 2 do",
  "    swapped ← false",
  "    for j ← 0 to n - i - 2 do",
  "      if A[j] > A[j + 1] then",
  "        swap A[j] and A[j + 1]",
  "        swapped ← true",
  "    mark A[n - i - 1] as sorted",
  "    if not swapped then break",
  "end procedure",
];

const javaCode = `public class BubbleSort {

    public static void sort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (a[j] > a[j + 1]) {
                    int tmp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = tmp;
                    swapped = true;
                }
            }
            // a[n - i - 1] is now in its final position
            if (!swapped) break;
        }
    }
}`;

function generateSteps(input: number[], order: SortOrder): SortStep[] {
  const rec = new StepRecorder(input);
  const a = rec.array;
  const n = a.length;
  const totalPasses = Math.max(n - 1, 1);

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

  outer: for (let i = 0; i < n - 1; i++) {
    const phase = ordinalPhase(i + 1, totalPasses);
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      rec.countComparison();
      rec.record({
        action: "COMPARE",
        indices: [j, j + 1],
        explanation: `Comparing elements at positions ${j} and ${j + 1} (${a[j]} vs ${a[j + 1]}).`,
        pseudocodeLine: 4,
        phase,
      });

      if (StepRecorder.shouldSwap(a[j], a[j + 1], order)) {
        const left = a[j];
        const right = a[j + 1];
        rec.countSwap();
        rec.swap(j, j + 1);
        swapped = true;
        rec.record({
          action: "SWAP",
          indices: [j, j + 1],
          explanation: `Swapping ${left} and ${right} because they are out of ${
            order === "asc" ? "ascending" : "descending"
          } order.`,
          pseudocodeLine: 5,
          phase,
        });
      }
    }

    const lockedIndex = n - i - 1;
    rec.markSorted(lockedIndex);
    rec.record({
      action: "MARK_SORTED",
      indices: [lockedIndex],
      explanation: `The current pass is complete. ${a[lockedIndex]} bubbled to position ${lockedIndex} and is now in its correct position.`,
      pseudocodeLine: 7,
      phase,
    });

    if (!swapped) {
      for (let k = 0; k < n; k++) rec.markSorted(k);
      rec.record({
        action: "MARK_SORTED",
        indices: [],
        explanation:
          "No swaps happened during this pass, so the array is already sorted. Bubble sort exits early.",
        pseudocodeLine: 8,
        phase,
      });
      break outer;
    }
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

export const bubbleSort: Algorithm = {
  id: "bubble",
  name: "Bubble Sort",
  family: "quadratic",
  tagline: "Repeatedly swap adjacent out-of-order neighbours.",
  description:
    "Bubble sort walks through the array again and again, comparing each pair of neighbours and swapping them when they are out of order. After every pass the largest remaining element has 'bubbled' to the end, so the unsorted region shrinks by one. If a full pass makes no swaps the array is already sorted and the algorithm stops early.",
  complexity: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
  },
  pseudocode,
  javaCode,
  generateSteps,
};
