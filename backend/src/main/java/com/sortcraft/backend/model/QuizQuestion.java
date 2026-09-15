package com.sortcraft.backend.model;

import java.util.List;

public class QuizQuestion {
    private String id;
    private String prompt;
    private List<String> options;
    /** Zero-based index into {@code options}. */
    private int answer;
    private String explanation;

    public QuizQuestion() {
    }

    public QuizQuestion(String id, String prompt, List<String> options, int answer, String explanation) {
        this.id = id;
        this.prompt = prompt;
        this.options = options;
        this.answer = answer;
        this.explanation = explanation;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public int getAnswer() {
        return answer;
    }

    public void setAnswer(int answer) {
        this.answer = answer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}