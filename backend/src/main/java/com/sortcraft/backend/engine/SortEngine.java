package com.sortcraft.backend.engine;

import com.sortcraft.backend.model.ActionType;
import com.sortcraft.backend.model.SortOrder;
import com.sortcraft.backend.model.SortStep;

import java.util.ArrayList;
import java.util.List;

/**
 * Java port of {@code src/algorithms/*}; each method reproduces the exact step
 * sequence the TypeScript engine emits (same snapshots, counters, explanations,
 * pseudocode lines, phases and highlight indices).
 *
 * The entry point is {@link #generateSteps(String, int[], SortOrder)}.
 */
public final class SortEngine {

    private SortEngine() {
    }

    public static List<SortStep> generateSteps(String algorithmId, int[] input, SortOrder order) {
        return switch (algorithmId) {
            case "bubble" -> bubbleSort(input, order);
            case "selection" -> selectionSort(input, order);
            case "insertion" -> insertionSort(input, order);
            case "shell" -> shellSort(input, order);
            case "merge" -> mergeSort(input, order);
            case "quick" -> quickSort(input, order);
            case "heap" -> heapSort(input, order);
            default -> throw new IllegalArgumentException("Unknown algorithm: " + algorithmId);
        };
    }

    // ---- Bubble sort -----------------------------------------------------

    private static List<SortStep> bubbleSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;
        int totalPasses = Math.max(n - 1, 1);

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 9, "Complete");
            return rec.result();
        }

        boolean early = false;
        for (int i = 0; i < n - 1; i++) {
            String phase = StepRecorder.ordinalPhase(i + 1, totalPasses);
            boolean swapped = false;

            for (int j = 0; j < n - i - 1; j++) {
                rec.compare();
                rec.record(ActionType.COMPARE, new int[]{j, j + 1},
                        "Comparing elements at positions " + j + " and " + (j + 1) + " ("
                                + rec.get(j) + " vs " + rec.get(j + 1) + ").", 4, phase);

                if (StepRecorder.shouldSwap(rec.get(j), rec.get(j + 1), order)) {
                    int left = rec.get(j);
                    int right = rec.get(j + 1);
                    rec.countSwap();
                    rec.swap(j, j + 1);
                    swapped = true;
                    rec.record(ActionType.SWAP, new int[]{j, j + 1},
                            "Swapping " + left + " and " + right + " because they are out of "
                                    + (order == SortOrder.asc ? "ascending" : "descending") + " order.", 5, phase);
                }
            }

            int lockedIndex = n - i - 1;
            rec.markSorted(lockedIndex);
            rec.record(ActionType.MARK_SORTED, new int[]{lockedIndex},
                    "The current pass is complete. " + rec.get(lockedIndex) + " bubbled to position "
                            + lockedIndex + " and is now in its correct position.", 7, phase);

            if (!swapped) {
                for (int k = 0; k < n; k++) rec.markSorted(k);
                rec.record(ActionType.MARK_SORTED, new int[]{},
                        "No swaps happened during this pass, so the array is already sorted. Bubble sort exits early.", 8, phase);
                early = true;
                break;
            }
        }

        if (!early) {
            rec.markAllSorted();
        }
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 9, "Complete");
        return rec.result();
    }

    // ---- Selection sort ---------------------------------------------------

    private static List<SortStep> selectionSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;
        int totalPasses = Math.max(n - 1, 1);
        String keyword = order == SortOrder.asc ? "smallest" : "largest";

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 9, "Complete");
            return rec.result();
        }

        for (int i = 0; i < n - 1; i++) {
            String phase = StepRecorder.ordinalPhase(i + 1, totalPasses);
            int best = i;

            rec.record(ActionType.COMPARE, new int[]{i},
                    "Starting pass " + (i + 1) + ": assume position " + i + " holds the " + keyword
                            + " remaining value (" + rec.get(i) + ").", 2, phase, new int[]{best});

            for (int j = i + 1; j < n; j++) {
                rec.compare();
                rec.record(ActionType.COMPARE, new int[]{j, best},
                        "Comparing elements at positions " + j + " and " + best + " ("
                                + rec.get(j) + " vs " + rec.get(best) + ").", 4, phase, new int[]{best});

                if (StepRecorder.isBefore(rec.get(j), rec.get(best), order)) {
                    best = j;
                    rec.record(ActionType.COMPARE, new int[]{j},
                            "New " + keyword + " candidate found: " + rec.get(j) + " at position " + j + ".", 5, phase,
                            new int[]{best});
                }
            }

            if (best != i) {
                int left = rec.get(i);
                int right = rec.get(best);
                rec.countSwap();
                rec.swap(i, best);
                rec.record(ActionType.SWAP, new int[]{i, best},
                        "Swapping " + left + " and " + right + " to move the " + keyword
                                + " remaining value into position " + i + ".", 7, phase, new int[]{i});
            }

            rec.markSorted(i);
            rec.record(ActionType.MARK_SORTED, new int[]{i},
                    "The element " + rec.get(i) + " is now in its correct position. The current pass is complete.", 8, phase);
        }

        rec.markAllSorted();
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 9, "Complete");
        return rec.result();
    }

    // ---- Insertion sort ---------------------------------------------------

    private static List<SortStep> insertionSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;
        int totalPasses = Math.max(n - 1, 1);

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 8, "Complete");
            return rec.result();
        }

        rec.markSorted(0);
        rec.record(ActionType.MARK_SORTED, new int[]{0},
                "A single element is trivially sorted, so we start the sorted region at position 0.", 1,
                StepRecorder.ordinalPhase(1, totalPasses));

        for (int i = 1; i < n; i++) {
            String phase = StepRecorder.ordinalPhase(i, totalPasses);
            int key = rec.get(i);
            int j = i - 1;

            rec.record(ActionType.COMPARE, new int[]{i},
                    "Selecting " + key + " at position " + i + " as the key to insert into the sorted region.", 2, phase,
                    new int[]{i});

            while (j >= 0) {
                rec.compare();
                rec.record(ActionType.COMPARE, new int[]{j, j + 1},
                        "Comparing key " + key + " with " + rec.get(j) + " at position " + j + ".", 4, phase,
                        new int[]{i});

                if (!StepRecorder.shouldSwap(rec.get(j), key, order)) break;

                rec.countSwap();
                rec.write(j + 1, rec.get(j));
                rec.record(ActionType.SHIFT, new int[]{j, j + 1},
                        "Shifting " + rec.get(j + 1) + " one position to the right to make room for the key.", 5, phase,
                        new int[]{i});
                j -= 1;
            }

            rec.write(j + 1, key);
            rec.markSorted(i);
            rec.record(ActionType.INSERT, new int[]{j + 1},
                    "Inserting key " + key + " at position " + (j + 1)
                            + ". The element is now in its correct position within the sorted region.", 7, phase,
                    new int[]{j + 1});
        }

        rec.markAllSorted();
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 8, "Complete");
        return rec.result();
    }

    // ---- Shell sort -------------------------------------------------------

    private static List<SortStep> shellSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 10, "Complete");
            return rec.result();
        }

        for (int gap = n / 2; gap > 0; gap = gap / 2) {
            String phase = "Gap = " + gap;
            rec.record(ActionType.COMPARE, new int[]{},
                    "Starting a new pass with gap " + gap + ": elements " + gap + " positions apart are compared.", 1, phase);

            for (int i = gap; i < n; i++) {
                int temp = rec.get(i);
                int j = i;

                rec.record(ActionType.COMPARE, new int[]{i},
                        "Taking " + temp + " at position " + i + " as the key for this gapped insertion.", 4, phase,
                        new int[]{i});

                while (j >= gap) {
                    rec.compare();
                    rec.record(ActionType.COMPARE, new int[]{j - gap, j},
                            "Comparing " + rec.get(j - gap) + " at position " + (j - gap)
                                    + " with the key " + temp + ".", 5, phase, new int[]{i});

                    if (!StepRecorder.shouldSwap(rec.get(j - gap), temp, order)) break;

                    rec.countSwap();
                    rec.write(j, rec.get(j - gap));
                    rec.record(ActionType.SHIFT, new int[]{j - gap, j},
                            "Shifting " + rec.get(j) + " from position " + (j - gap) + " to position " + j
                                    + " (a jump of " + gap + ").", 6, phase, new int[]{i});
                    j -= gap;
                }

                rec.write(j, temp);
                rec.record(ActionType.INSERT, new int[]{j},
                        "Inserting key " + temp + " at position " + j + ".", 8, phase, new int[]{j});
            }

            if (gap == 1) {
                rec.markAllSorted();
                rec.record(ActionType.MARK_SORTED, new int[]{},
                        "The final gap of 1 is a plain insertion sort on a nearly sorted array — the array is now fully sorted.", 9, phase);
            }
        }

        rec.markAllSorted();
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 10, "Complete");
        return rec.result();
    }

    // ---- Merge sort -------------------------------------------------------

    private static List<SortStep> mergeSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 12, "Complete");
            return rec.result();
        }

        mergeSortHelper(rec, 0, n - 1, 1, order);

        rec.markAllSorted();
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 12, "Complete");
        return rec.result();
    }

    private static void mergeSortHelper(StepRecorder rec, int lo, int hi, int depth, SortOrder order) {
        if (lo >= hi) return;
        int mid = (lo + hi) / 2;
        rec.record(ActionType.COMPARE, new int[]{},
                "Splitting [" + lo + "…" + hi + "] at index " + mid + " into two halves (divide step).", 2,
                "Split level " + depth + " · [" + lo + "…" + hi + "]", range(lo, hi));
        mergeSortHelper(rec, lo, mid, depth + 1, order);
        mergeSortHelper(rec, mid + 1, hi, depth + 1, order);
        merge(rec, lo, mid, hi, depth, order);
    }

    private static void merge(StepRecorder rec, int lo, int mid, int hi, int depth, SortOrder order) {
        int n = rec.size();
        String phase = "Merge level " + depth + " · [" + lo + "…" + hi + "]";
        List<Integer> left = new ArrayList<>(rec.array().subList(lo, mid + 1));
        List<Integer> right = new ArrayList<>(rec.array().subList(mid + 1, hi + 1));
        int[] window = range(lo, hi);

        rec.record(ActionType.COMPARE, new int[]{},
                "Merging the sorted halves [" + lo + "…" + mid + "] and [" + (mid + 1) + "…" + hi + "] back together.", 7, phase, window);

        int i = 0;
        int j = 0;
        int k = lo;

        while (i < left.size() && j < right.size()) {
            rec.compare();
            rec.record(ActionType.COMPARE, new int[]{lo + i, mid + 1 + j},
                    "Comparing " + left.get(i) + " from the left half with " + right.get(j) + " from the right half.", 8, phase, window);

            boolean takeLeft = !StepRecorder.isBefore(right.get(j), left.get(i), order);
            int value = takeLeft ? left.get(i) : right.get(j);
            rec.countSwap();
            rec.write(k, value);
            rec.record(ActionType.OVERWRITE, new int[]{k},
                    "Writing " + value + " from the " + (takeLeft ? "left" : "right") + " half into position " + k + ".",
                    takeLeft ? 9 : 10, phase, window);
            if (takeLeft) i += 1;
            else j += 1;
            k += 1;
        }

        while (i < left.size()) {
            int value = left.get(i);
            rec.countSwap();
            rec.write(k, value);
            rec.record(ActionType.OVERWRITE, new int[]{k},
                    "Copying the remaining left-half value " + value + " into position " + k + ".", 11, phase, window);
            i += 1;
            k += 1;
        }

        while (j < right.size()) {
            int value = right.get(j);
            rec.countSwap();
            rec.write(k, value);
            rec.record(ActionType.OVERWRITE, new int[]{k},
                    "Copying the remaining right-half value " + value + " into position " + k + ".", 11, phase, window);
            j += 1;
            k += 1;
        }

        if (lo == 0 && hi == n - 1) {
            rec.markAllSorted();
        }
        rec.record(ActionType.MARK_SORTED, window,
                "The sub-array [" + lo + "…" + hi + "] is now fully merged and sorted.", 5, phase,
                lo == 0 && hi == n - 1 ? new int[]{} : window);
    }

    // ---- Quick sort -------------------------------------------------------

    private static List<SortStep> quickSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 11, "Complete");
            return rec.result();
        }

        quickSortHelper(rec, 0, n - 1, 1, order);

        rec.markAllSorted();
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 11, "Complete");
        return rec.result();
    }

    private static void quickSortHelper(StepRecorder rec, int lo, int hi, int depth, SortOrder order) {
        if (lo > hi) return;
        if (lo == hi) {
            rec.markSorted(lo);
            rec.record(ActionType.MARK_SORTED, new int[]{lo},
                    "A single-element range [" + lo + "] is already sorted.", 1,
                    "Partition depth " + depth + " · [" + lo + "…" + hi + "]");
            return;
        }
        int pivotIndex = partition(rec, lo, hi, depth, order);
        quickSortHelper(rec, lo, pivotIndex - 1, depth + 1, order);
        quickSortHelper(rec, pivotIndex + 1, hi, depth + 1, order);
    }

    private static int partition(StepRecorder rec, int lo, int hi, int depth, SortOrder order) {
        String phase = "Partition depth " + depth + " · [" + lo + "…" + hi + "]";
        int pivot = rec.get(hi);

        rec.record(ActionType.PIVOT, new int[]{hi},
                "Choosing " + pivot + " at position " + hi + " as the pivot for the range [" + lo + "…" + hi + "].", 6, phase,
                new int[]{hi});

        int i = lo - 1;

        for (int j = lo; j < hi; j++) {
            rec.compare();
            rec.record(ActionType.COMPARE, new int[]{j, hi},
                    "Comparing " + rec.get(j) + " at position " + j + " with the pivot " + pivot + ".", 8, phase,
                    new int[]{hi});

            boolean belongsLeft = !StepRecorder.isBefore(pivot, rec.get(j), order);
            if (belongsLeft) {
                i += 1;
                if (i != j) {
                    int left = rec.get(i);
                    int right = rec.get(j);
                    rec.countSwap();
                    rec.swap(i, j);
                    rec.record(ActionType.SWAP, new int[]{i, j},
                            "Swapping " + left + " and " + right + " to move " + right + " into the left partition.", 9, phase,
                            new int[]{hi});
                } else {
                    rec.record(ActionType.COMPARE, new int[]{i},
                            rec.get(i) + " is already on the correct side of the pivot — no swap needed.", 9, phase,
                            new int[]{hi});
                }
            }
        }

        int pivotIndex = i + 1;
        if (pivotIndex != hi) {
            rec.countSwap();
            rec.swap(pivotIndex, hi);
            rec.record(ActionType.SWAP, new int[]{pivotIndex, hi},
                    "Placing the pivot " + pivot + " at position " + pivotIndex + ", between the two partitions.", 10, phase,
                    new int[]{pivotIndex});
        }

        rec.markSorted(pivotIndex);
        rec.record(ActionType.MARK_SORTED, new int[]{pivotIndex},
                "The pivot " + rec.get(pivotIndex) + " is now in its correct position and never moves again.", 11, phase);

        return pivotIndex;
    }

    // ---- Heap sort --------------------------------------------------------

    private static List<SortStep> heapSort(int[] input, SortOrder order) {
        StepRecorder rec = new StepRecorder(input);
        int n = input.length;
        String heapWord = order == SortOrder.asc ? "max" : "min";

        if (n <= 1) {
            rec.markAllSorted();
            rec.record(ActionType.COMPLETE, new int[]{},
                    "The array has fewer than two elements, so it is already sorted.", 10, "Complete");
            return rec.result();
        }

        for (int i = n / 2 - 1; i >= 0; i--) {
            rec.record(ActionType.COMPARE, new int[]{i},
                    "Sifting down index " + i + " to build the " + heapWord + "-heap.", 2, "Build heap",
                    new int[]{i});
            siftDown(rec, i, n, "Build heap", order, heapWord);
        }

        rec.record(ActionType.MARK_SORTED, new int[]{0},
                "The " + heapWord + "-heap is built: the root holds the "
                        + (order == SortOrder.asc ? "largest" : "smallest") + " value in the array.", 2, "Build heap",
                new int[]{0});

        for (int end = n - 1; end > 0; end--) {
            String phase = "Extract " + (n - end) + " of " + (n - 1);
            int root = rec.get(0);
            int last = rec.get(end);
            rec.countSwap();
            rec.swap(0, end);
            rec.markSorted(end);
            rec.record(ActionType.SWAP, new int[]{0, end},
                    "Swapping the root " + root + " with " + last + " at position " + end + ". " + root
                            + " is now in its correct position.", 4, phase);
            siftDown(rec, 0, end, phase, order, heapWord);
        }

        rec.markAllSorted();
        rec.record(ActionType.COMPLETE, new int[]{},
                "Sorting complete — every element is in its correct position.", 10, "Complete");
        return rec.result();
    }

    private static void siftDown(StepRecorder rec, int root, int size, String phase,
                                 SortOrder order, String heapWord) {
        int best = root;
        int left = 2 * root + 1;
        int right = 2 * root + 2;

        for (int child : new int[]{left, right}) {
            if (child >= size) continue;
            rec.compare();
            rec.record(ActionType.COMPARE, new int[]{child, best},
                    "Comparing child " + rec.get(child) + " at index " + child + " with the current "
                            + heapWord + " " + rec.get(best) + " at index " + best + ".", 8, phase,
                    new int[]{root});
            if (dominates(rec.get(child), rec.get(best), order)) best = child;
        }

        if (best != root) {
            int from = rec.get(root);
            int to = rec.get(best);
            rec.countSwap();
            rec.swap(root, best);
            rec.record(ActionType.SWAP, new int[]{root, best},
                    "Swapping " + from + " and " + to + " so the larger value moves up toward the root of the heap.", 9, phase,
                    new int[]{best});
            siftDown(rec, best, size, phase, order, heapWord);
        }
    }

    private static boolean dominates(int candidate, int current, SortOrder order) {
        return order == SortOrder.asc ? candidate > current : candidate < current;
    }

    private static int[] range(int lo, int hi) {
        int[] result = new int[hi - lo + 1];
        for (int i = lo; i <= hi; i++) {
            result[i - lo] = i;
        }
        return result;
    }
}