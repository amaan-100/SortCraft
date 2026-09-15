package com.sortcraft.backend.model;

import java.util.List;

/**
 * A single animation step, JSON-identical to the frontend's {@code SortStep}.
 */
public class SortStep {
    private ActionType action;
    private List<Integer> array;
    private List<Integer> indices;
    private String explanation;
    private int pseudocodeLine;
    private int comparisons;
    private int swaps;
    private String phase;
    private List<Integer> sortedIndices;
    private List<Integer> selectedIndices;

    public SortStep() {
    }

    public SortStep(ActionType action, List<Integer> array, List<Integer> indices,
                    String explanation, int pseudocodeLine, int comparisons, int swaps,
                    String phase, List<Integer> sortedIndices, List<Integer> selectedIndices) {
        this.action = action;
        this.array = array;
        this.indices = indices;
        this.explanation = explanation;
        this.pseudocodeLine = pseudocodeLine;
        this.comparisons = comparisons;
        this.swaps = swaps;
        this.phase = phase;
        this.sortedIndices = sortedIndices;
        this.selectedIndices = selectedIndices;
    }

    public ActionType getAction() {
        return action;
    }

    public void setAction(ActionType action) {
        this.action = action;
    }

    public List<Integer> getArray() {
        return array;
    }

    public void setArray(List<Integer> array) {
        this.array = array;
    }

    public List<Integer> getIndices() {
        return indices;
    }

    public void setIndices(List<Integer> indices) {
        this.indices = indices;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getPseudocodeLine() {
        return pseudocodeLine;
    }

    public void setPseudocodeLine(int pseudocodeLine) {
        this.pseudocodeLine = pseudocodeLine;
    }

    public int getComparisons() {
        return comparisons;
    }

    public void setComparisons(int comparisons) {
        this.comparisons = comparisons;
    }

    public int getSwaps() {
        return swaps;
    }

    public void setSwaps(int swaps) {
        this.swaps = swaps;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public List<Integer> getSortedIndices() {
        return sortedIndices;
    }

    public void setSortedIndices(List<Integer> sortedIndices) {
        this.sortedIndices = sortedIndices;
    }

    public List<Integer> getSelectedIndices() {
        return selectedIndices;
    }

    public void setSelectedIndices(List<Integer> selectedIndices) {
        this.selectedIndices = selectedIndices;
    }
}