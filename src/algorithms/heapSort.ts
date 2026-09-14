import { StepRecorder } from "./stepRecorder";
import type { Algorithm, SortOrder, SortStep } from "./types";

const pseudocode = [
  "procedure heapSort(A, n)",
  "  for i ← n/2 - 1 down to 0 do",
  "    siftDown(A, i, n)            // build max-heap",
  "  for end ← n - 1 down to 1 do",
  "    swap A[0] and A[end]",
  "    siftDown(A, 0, end)",
  "procedure siftDown(A, root, size)",
  "  largest ← root; l ← 2r+1; r ← 2r+2",
  "  if child > A[largest] then largest ← child",
  "  if largest ≠ root then swap and recurse",
  "end procedure",
];

const javaCode = `public class HeapSort {

    public static void sort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);
        for (int end = n - 1; end > 0; end--) {
            int tmp = a[0]; a[0] = a[end]; a[end] = tmp;
            siftDown(a, 0, end);
        }
    }

    private static void siftDown(int[] a, int root, int size) {
        int largest = root;
        int l = 2 * root + 1, r = 2 * root + 2;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest != root) {
            int tmp = a[root]; a[root] = a[largest]; a[largest] = tmp;
            siftDown(a, largest, size);
        }
    }
}`;

function generateSteps(input: number[], order: SortOrder): SortStep[] {
  const rec = new StepRecorder(input);
  const a = rec.array;
  const n = a.length;
  // Ascending order needs a max-heap; descending needs a min-heap.
  const heapWord = order === "asc" ? "max" : "min";

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

  /** true when `candidate` should sit above `current` in the heap */
  const dominates = (candidate: number, current: number) =>
    order === "asc" ? candidate > current : candidate < current;

  const siftDown = (root: number, size: number, phase: string) => {
    let best = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    for (const child of [left, right]) {
      if (child >= size) continue;
      rec.countComparison();
      rec.record({
        action: "COMPARE",
        indices: [child, best],
        explanation: `Comparing child ${a[child]} at index ${child} with the current ${heapWord} ${a[best]} at index ${best}.`,
        pseudocodeLine: 8,
        phase,
        selected: [root],
      });
      if (dominates(a[child], a[best])) best = child;
    }

    if (best !== root) {
      const from = a[root];
      const to = a[best];
      rec.countSwap();
      rec.swap(root, best);
      rec.record({
        action: "SWAP",
        indices: [root, best],
        explanation: `Swapping ${from} and ${to} so the larger value moves up toward the root of the heap.`,
        pseudocodeLine: 9,
        phase,
        selected: [best],
      });
      siftDown(best, size, phase);
    }
  };

  // Phase 1 — build the heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    rec.record({
      action: "COMPARE",
      indices: [i],
      explanation: `Sifting down index ${i} to build the ${heapWord}-heap.`,
      pseudocodeLine: 2,
      phase: "Build heap",
      selected: [i],
    });
    siftDown(i, n, "Build heap");
  }

  rec.record({
    action: "MARK_SORTED",
    indices: [0],
    explanation: `The ${heapWord}-heap is built: the root holds the ${
      order === "asc" ? "largest" : "smallest"
    } value in the array.`,
    pseudocodeLine: 2,
    phase: "Build heap",
    selected: [0],
  });

  // Phase 2 — repeatedly move the root to the end
  for (let end = n - 1; end > 0; end--) {
    const phase = `Extract ${n - end} of ${n - 1}`;
    const root = a[0];
    const last = a[end];
    rec.countSwap();
    rec.swap(0, end);
    rec.markSorted(end);
    rec.record({
      action: "SWAP",
      indices: [0, end],
      explanation: `Swapping the root ${root} with ${last} at position ${end}. ${root} is now in its correct position.`,
      pseudocodeLine: 4,
      phase,
    });
    siftDown(0, end, phase);
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

export const heapSort: Algorithm = {
  id: "heap",
  name: "Heap Sort",
  family: "advanced",
  tagline: "Build a heap, then repeatedly extract the root.",
  description:
    "Heap sort treats the array as a binary heap. It first turns the whole array into a max-heap in O(n), then repeatedly swaps the root (the largest value) with the last unsorted slot and sifts the new root back down. It gives a guaranteed O(n log n) with only O(1) extra space, but it is not stable and has poor cache locality.",
  complexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: false,
    inPlace: true,
  },
  pseudocode,
  javaCode,
  generateSteps,
};
