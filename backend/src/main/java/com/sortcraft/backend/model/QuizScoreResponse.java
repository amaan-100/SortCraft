package com.sortcraft.backend.model;

import java.util.List;

/** Server-side quiz scoring result, mirroring the Supabase RPC response shape. */
public class QuizScoreResponse {
    private int score;
    private int total;
    private boolean passed;
    private int xp;
    private int xpReward;
    private List<CheckedAnswer> checked;

    public QuizScoreResponse() {
    }

    public QuizScoreResponse(int score, int total, boolean passed, int xp,
                             int xpReward, List<CheckedAnswer> checked) {
        this.score = score;
        this.total = total;
        this.passed = passed;
        this.xp = xp;
        this.xpReward = xpReward;
        this.checked = checked;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public List<CheckedAnswer> getChecked() {
        return checked;
    }

    public void setChecked(List<CheckedAnswer> checked) {
        this.checked = checked;
    }
}