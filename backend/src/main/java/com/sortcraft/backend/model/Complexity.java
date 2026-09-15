package com.sortcraft.backend.model;

public class Complexity {
    private String best;
    private String average;
    private String worst;
    private String space;
    private boolean stable;
    private boolean inPlace;

    public Complexity() {
    }

    public Complexity(String best, String average, String worst, String space,
                      boolean stable, boolean inPlace) {
        this.best = best;
        this.average = average;
        this.worst = worst;
        this.space = space;
        this.stable = stable;
        this.inPlace = inPlace;
    }

    public String getBest() {
        return best;
    }

    public void setBest(String best) {
        this.best = best;
    }

    public String getAverage() {
        return average;
    }

    public void setAverage(String average) {
        this.average = average;
    }

    public String getWorst() {
        return worst;
    }

    public void setWorst(String worst) {
        this.worst = worst;
    }

    public String getSpace() {
        return space;
    }

    public void setSpace(String space) {
        this.space = space;
    }

    public boolean isStable() {
        return stable;
    }

    public void setStable(boolean stable) {
        this.stable = stable;
    }

    public boolean isInPlace() {
        return inPlace;
    }

    public void setInPlace(boolean inPlace) {
        this.inPlace = inPlace;
    }
}