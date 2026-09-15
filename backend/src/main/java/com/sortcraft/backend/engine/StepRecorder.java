package com.sortcraft.backend.engine;

import com.sortcraft.backend.model.ActionType;
import com.sortcraft.backend.model.SortOrder;
import com.sortcraft.backend.model.SortStep;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

/**
 * Java port of {@code src/algorithms/stepRecorder.ts}. Owns the working array,
 * the running comparison/swap counters and the sorted-index set, and appends a
 * full array snapshot for every recorded step so the player can scrub freely.
 */
public final class StepRecorder {

    private final List<Integer> array;
    private final List<SortStep> steps = new ArrayList<>();
    private final TreeSet<Integer> sorted = new TreeSet<>();
    private int comparisons;
    private int swaps;

    public StepRecorder(int[] input) {
        this.array = new ArrayList<>(input.length);
        for (int value : input) {
            this.array.add(value);
        }
    }

    /** Comparison helper honouring the requested sort order. */
    public static boolean shouldSwap(int a, int b, SortOrder order) {
        return order == SortOrder.asc ? a > b : a < b;
    }

    /** True when {@code a} should appear before {@code b}. */
    public static boolean isBefore(int a, int b, SortOrder order) {
        return order == SortOrder.asc ? a < b : a > b;
    }

    public int compare() {
        return comparisons += 1;
    }

    public int countSwap() {
        return swaps += 1;
    }

    public void markSorted(int index) {
        sorted.add(index);
    }

    public void markAllSorted() {
        for (int i = 0; i < array.size(); i++) {
            sorted.add(i);
        }
    }

    public void swap(int i, int j) {
        int tmp = array.get(i);
        array.set(i, array.get(j));
        array.set(j, tmp);
    }

    public void write(int index, int value) {
        array.set(index, value);
    }

    public int get(int index) {
        return array.get(index);
    }

    /** Backing list — read-only use only (sort helpers take half copies). */
    public List<Integer> array() {
        return array;
    }

    public int size() {
        return array.size();
    }

    public int[] toArraySnapshot() {
        int[] copy = new int[array.size()];
        for (int i = 0; i < array.size(); i++) {
            copy[i] = array.get(i);
        }
        return copy;
    }

    public void record(ActionType action, int[] indices, String explanation,
                       int pseudocodeLine, String phase) {
        record(action, indices, explanation, pseudocodeLine, phase, new int[0]);
    }

    public void record(ActionType action, int[] indices, String explanation,
                       int pseudocodeLine, String phase, int[] selected) {
        List<Integer> snapshot = new ArrayList<>(array);
        List<Integer> indexList = new ArrayList<>(indices.length);
        for (int value : indices) {
            indexList.add(value);
        }
        List<Integer> selectedList = new ArrayList<>(selected.length);
        for (int value : selected) {
            selectedList.add(value);
        }
        steps.add(new SortStep(action, snapshot, indexList, explanation, pseudocodeLine,
                comparisons, swaps, phase, new ArrayList<>(sorted), selectedList));
    }

    public List<SortStep> result() {
        return steps;
    }

    public static String ordinalPhase(int pass, int total) {
        return "Pass " + pass + " of " + total;
    }
}