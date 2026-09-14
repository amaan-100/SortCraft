import { StepRecorder, ordinalPhase } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure insertionSort(A, n)",
  "  for i ← 1 to n - 1 do",
  "    key ← A[i]",
  "    j ← i - 1",
  "    while j ≥ 0 and A[j] > key do",
  "      A[j + 1] ← A[j]            // shift right",
  "      j ← j - 1",
  "    A[j + 1] ← key               // insert key",
  "end procedure",
];

const javaCode = `public class InsertionSort {

    public static void sort(int[] a) {
        int n = a.length;
        for (int i = 1; i < n; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];   // shift right
                j--;
            }
            a[j + 1] = key;        // insert key
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
      pseudocodeLine: 8,
      phase: "Complete",
    });
    return rec.result();
  }

  rec.markSorted(0);
  rec.record({
    action: "MARK_SORTED",
    indices: [0],
    explanation: "A single element is trivially sorted, so we start the sorted region at position 0.",
    pseudocodeLine: 1,
    phase: ordinalPhase(1, totalPasses),
  });

  for (let i = 1; i < n; i++) {
    const phase = ordinalPhase(i, totalPasses);
    const key = a[i];
    let j = i - 1;

    rec.record({
      action: "COMPARE",
      indices: [i],
      explanation: `Selecting ${key} at position ${i} as the key to insert into the sorted region.`,
      pseudocodeLine: 2,
      phase,
      selected: [i],
    });

    while (j >= 0) {
      rec.countComparison();
      rec.record({
        action: "COMPARE",
        indices: [j, j + 1],
        explanation: `Comparing key ${key} with ${a[j]} at position ${j}.`,
        pseudocodeLine: 4,
        phase,
        selected: [i],
      });

      if (!StepRecorder.shouldSwap(a[j], key, order)) break;

      rec.countSwap();
      rec.write(j + 1, a[j]);
      rec.record({
        action: "SHIFT",
        indices: [j, j + 1],
        explanation: `Shifting ${a[j + 1]} one position to the right to make room for the key.`,
        pseudocodeLine: 5,
        phase,
        selected: [i],
      });
      j -= 1;
    }

    rec.write(j + 1, key);
    rec.markSorted(i);
    rec.record({
      action: "INSERT",
      indices: [j + 1],
      explanation: `Inserting key ${key} at position ${j + 1}. The element is now in its correct position within the sorted region.`,
      pseudocodeLine: 7,
      phase,
      selected: [j + 1],
    });
  }

  rec.markAllSorted();
  rec.record({
    action: "COMPLETE",
    indices: [],
    explanation: "Sorting complete — every element is in its correct position.",
    pseudocodeLine: 8,
    phase: "Complete",
  });

  return rec.result();
}

export const insertionSort: Algorithm = {
  id: "insertion",
  name: "Insertion Sort",
  family: "quadratic",
  tagline: "Grow a sorted region by inserting each new element into place.",
  description:
    "Insertion sort builds the final array one element at a time, exactly like sorting a hand of playing cards. It takes the next element (the key), shifts every larger element of the sorted prefix one slot to the right and drops the key into the gap. It is very fast on nearly sorted data.",
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
