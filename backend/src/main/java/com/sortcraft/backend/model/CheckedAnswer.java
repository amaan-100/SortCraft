package com.sortcraft.backend.model;

public class CheckedAnswer {
    private String questionId;
    private Integer selected;
    private boolean correct;

    public CheckedAnswer() {
    }

    public CheckedAnswer(String questionId, Integer selected, boolean correct) {
        this.questionId = questionId;
        this.selected = selected;
        this.correct = correct;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Integer getSelected() {
        return selected;
    }

    public void setSelected(Integer selected) {
        this.selected = selected;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }
}