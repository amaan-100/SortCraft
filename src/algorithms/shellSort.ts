import { StepRecorder } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure shellSort(A, n)",
  "  gap ← n / 2",
  "  while gap > 0 do",
  "    for i ← gap to n - 1 do",
  "      temp ← A[i]; j ← i",
  "      while j ≥ gap and A[j-gap] > temp do",
  "        A[j] ← A[j - gap]",
  "        j ← j - gap",
  "      A[j] ← temp",
  "    gap ← gap / 2",
  "end procedure",
];

const javaCode = `public class ShellSort {

    public static void sort(int[] a) {
        int n = a.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = a[i];
                int j = i;
                while (j >= gap && a[j - gap] > temp) {
                    a[j] = a[j - gap];
                    j -= gap;
                }
                a[j] = temp;
            }
        }
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
      pseudocodeLine: 10,
      phase: "Complete",
    });
    return rec.result();
  }

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    const phase = `Gap = ${gap}`;
    rec.record({
      action: "COMPARE",
      indices: [],
      explanation: `Starting a new pass with gap ${gap}: elements ${gap} positions apart are compared.`,
      pseudocodeLine: 1,
      phase,
    });

    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;

      rec.record({
        action: "COMPARE",
        indices: [i],
        explanation: `Taking ${temp} at position ${i} as the key for this gapped insertion.`,
        pseudocodeLine: 4,
        phase,
        selected: [i],
      });

      while (j >= gap) {
        rec.countComparison();
        rec.record({
          action: "COMPARE",
          indices: [j - gap, j],
          explanation: `Comparing ${a[j - gap]} at position ${j - gap} with the key ${temp}.`,
          pseudocodeLine: 5,
          phase,
          selected: [i],
        });

        if (!StepRecorder.shouldSwap(a[j - gap], temp, order)) break;

        rec.countSwap();
        rec.write(j, a[j - gap]);
        rec.record({
          action: "SHIFT",
          indices: [j - gap, j],
          explanation: `Shifting ${a[j]} from position ${j - gap} to position ${j} (a jump of ${gap}).`,
          pseudocodeLine: 6,
          phase,
          selected: [i],
        });
        j -= gap;
      }

      rec.write(j, temp);
      rec.record({
        action: "INSERT",
        indices: [j],
        explanation: `Inserting key ${temp} at position ${j}.`,
        pseudocodeLine: 8,
        phase,
        selected: [j],
      });
    }

    if (gap === 1) {
      rec.markAllSorted();
      rec.record({
        action: "MARK_SORTED",
        indices: [],
        explanation:
          "The final gap of 1 is a plain insertion sort on a nearly sorted array — the array is now fully sorted.",
        pseudocodeLine: 9,
        phase,
      });
    }
  }

  rec.markAllSorted();
  rec.record({
    action: "COMPLETE",
    indices: [],
    explanation: "Sorting complete — every element is in its correct position.",
    pseudocodeLine: 10,
    phase: "Complete",
  });

  return rec.result();
}

export const shellSort: Algorithm = {
  id: "shell",
  name: "Shell Sort",
  family: "advanced",
  tagline: "Insertion sort on gapped sub-sequences, shrinking the gap to 1.",
  description:
    "Shell sort generalises insertion sort. Instead of comparing neighbours it first compares elements a large gap apart, which lets values travel a long way in a single move. The gap keeps halving until it reaches 1, at which point the array is nearly sorted and the final insertion pass is very cheap.",
  complexity: {
    best: "O(n log n)",
    average: "O(n^1.25)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
  },
  pseudocode,
  javaCode,
  generateSteps,
};
