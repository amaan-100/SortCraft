package com.sortcraft.backend.data;

import com.sortcraft.backend.model.AlgorithmMeta;
import com.sortcraft.backend.model.Complexity;

import java.util.List;

/**
 * Java port of the {@code meta} blocks in {@code src/algorithms/*}. Serves the
 * visualizer's code panel, complexity card and the compare/landing pages.
 */
public final class AlgorithmCatalog {

    private AlgorithmCatalog() {
    }

    public static List<AlgorithmMeta> all() {
        return List.of(bubble(), selection(), insertion(), shell(), merge(), quick(), heap());
    }

    public static AlgorithmMeta bubble() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("bubble");
        meta.setName("Bubble Sort");
        meta.setFamily("quadratic");
        meta.setTagline("Repeatedly swap adjacent out-of-order neighbours.");
        meta.setDescription(
                "Bubble sort walks through the array again and again, comparing each pair of neighbours and swapping them when they are out of order. After every pass the largest remaining element has 'bubbled' to the end, so the unsorted region shrinks by one. If a full pass makes no swaps the array is already sorted and the algorithm stops early.");
        meta.setComplexity(new Complexity("O(n)", "O(n²)", "O(n²)", "O(1)", true, true));
        meta.setPseudocode(List.of(
                "procedure bubbleSort(A, n)",
                "  for i ← 0 to n - 2 do",
                "    swapped ← false",
                "    for j ← 0 to n - i - 2 do",
                "      if A[j] > A[j + 1] then",
                "        swap A[j] and A[j + 1]",
                "        swapped ← true",
                "    mark A[n - i - 1] as sorted",
                "    if not swapped then break",
                "end procedure"));
        meta.setJavaCode("""
                public class BubbleSort {

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
                }""");
        return meta;
    }

    public static AlgorithmMeta selection() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("selection");
        meta.setName("Selection Sort");
        meta.setFamily("quadratic");
        meta.setTagline("Select the smallest remaining value and place it up front.");
        meta.setDescription(
                "Selection sort splits the array into a sorted prefix and an unsorted suffix. On every pass it scans the unsorted part to find the smallest (or largest) value, swaps it into the first unsorted slot and grows the sorted prefix by one. It always performs the same number of comparisons, but at most n − 1 swaps.");
        meta.setComplexity(new Complexity("O(n²)", "O(n²)", "O(n²)", "O(1)", false, true));
        meta.setPseudocode(List.of(
                "procedure selectionSort(A, n)",
                "  for i ← 0 to n - 2 do",
                "    best ← i",
                "    for j ← i + 1 to n - 1 do",
                "      if A[j] < A[best] then",
                "        best ← j",
                "    if best ≠ i then",
                "      swap A[i] and A[best]",
                "    mark A[i] as sorted",
                "end procedure"));
        meta.setJavaCode("""
                public class SelectionSort {

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
                }""");
        return meta;
    }

    public static AlgorithmMeta insertion() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("insertion");
        meta.setName("Insertion Sort");
        meta.setFamily("quadratic");
        meta.setTagline("Grow a sorted region by inserting each new element into place.");
        meta.setDescription(
                "Insertion sort builds the final array one element at a time, exactly like sorting a hand of playing cards. It takes the next element (the key), shifts every larger element of the sorted prefix one slot to the right and drops the key into the gap. It is very fast on nearly sorted data.");
        meta.setComplexity(new Complexity("O(n)", "O(n²)", "O(n²)", "O(1)", true, true));
        meta.setPseudocode(List.of(
                "procedure insertionSort(A, n)",
                "  for i ← 1 to n - 1 do",
                "    key ← A[i]",
                "    j ← i - 1",
                "    while j ≥ 0 and A[j] > key do",
                "      A[j + 1] ← A[j]            // shift right",
                "      j ← j - 1",
                "    A[j + 1] ← key               // insert key",
                "end procedure"));
        meta.setJavaCode("""
                public class InsertionSort {

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
                }""");
        return meta;
    }

    public static AlgorithmMeta shell() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("shell");
        meta.setName("Shell Sort");
        meta.setFamily("advanced");
        meta.setTagline("Insertion sort on gapped sub-sequences, shrinking the gap to 1.");
        meta.setDescription(
                "Shell sort generalises insertion sort. Instead of comparing neighbours it first compares elements a large gap apart, which lets values travel a long way in a single move. The gap keeps halving until it reaches 1, at which point the array is nearly sorted and the final insertion pass is very cheap.");
        meta.setComplexity(new Complexity("O(n log n)", "O(n^1.25)", "O(n²)", "O(1)", false, true));
        meta.setPseudocode(List.of(
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
                "end procedure"));
        meta.setJavaCode("""
                public class ShellSort {

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
                }""");
        return meta;
    }

    public static AlgorithmMeta merge() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("merge");
        meta.setName("Merge Sort");
        meta.setFamily("advanced");
        meta.setTagline("Divide the array in half, sort each half, then merge them.");
        meta.setDescription(
                "Merge sort is the classic divide-and-conquer sort. It recursively halves the array until each piece holds a single element, then merges neighbouring pieces back together in order. The merge step is linear and the recursion is logarithmic, giving a guaranteed O(n log n) — but it needs O(n) extra space for the temporary halves.");
        meta.setComplexity(new Complexity("O(n log n)", "O(n log n)", "O(n log n)", "O(n)", true, false));
        meta.setPseudocode(List.of(
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
                "end procedure"));
        meta.setJavaCode("""
                public class MergeSort {

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
                }""");
        return meta;
    }

    public static AlgorithmMeta quick() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("quick");
        meta.setName("Quick Sort");
        meta.setFamily("advanced");
        meta.setTagline("Partition around a pivot, then sort both sides.");
        meta.setDescription(
                "Quick sort picks a pivot and rearranges the array so everything smaller sits left of it and everything larger sits right. The pivot is then permanently in place and the two sides are sorted recursively. This visualization uses the Lomuto scheme with the last element as pivot — fast in practice, but O(n²) if the pivot choice is consistently poor.");
        meta.setComplexity(new Complexity("O(n log n)", "O(n log n)", "O(n²)", "O(log n)", false, true));
        meta.setPseudocode(List.of(
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
                "  return i + 1"));
        meta.setJavaCode("""
                public class QuickSort {

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
                }""");
        return meta;
    }

    public static AlgorithmMeta heap() {
        AlgorithmMeta meta = new AlgorithmMeta();
        meta.setId("heap");
        meta.setName("Heap Sort");
        meta.setFamily("advanced");
        meta.setTagline("Build a heap, then repeatedly extract the root.");
        meta.setDescription(
                "Heap sort treats the array as a binary heap. It first turns the whole array into a max-heap in O(n), then repeatedly swaps the root (the largest value) with the last unsorted slot and sifts the new root back down. It gives a guaranteed O(n log n) with only O(1) extra space, but it is not stable and has poor cache locality.");
        meta.setComplexity(new Complexity("O(n log n)", "O(n log n)", "O(n log n)", "O(1)", false, true));
        meta.setPseudocode(List.of(
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
                "end procedure"));
        meta.setJavaCode("""
                public class HeapSort {

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
                }""");
        return meta;
    }
}