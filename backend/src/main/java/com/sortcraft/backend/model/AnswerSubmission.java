package com.sortcraft.backend.model;

/** One submitted answer, keyed by stable question id (never array position). */
public class AnswerSubmission {
    private String questionId;
    private Integer selected;

    public AnswerSubmission() {
    }

    public AnswerSubmission(String questionId, Integer selected) {
        this.questionId = questionId;
        this.selected = selected;
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
}