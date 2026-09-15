package com.sortcraft.backend.model;

import java.util.List;

public class Level {
    private int id;
    private String title;
    private String subtitle;
    private int minutes;
    private int xpReward;
    private String algorithm;
    private List<String> lesson;
    private List<String> keyPoints;
    private List<QuizQuestion> quiz;

    public Level() {
    }

    public Level(int id, String title, String subtitle, int minutes, int xpReward,
                 String algorithm, List<String> lesson, List<String> keyPoints, List<QuizQuestion> quiz) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.minutes = minutes;
        this.xpReward = xpReward;
        this.algorithm = algorithm;
        this.lesson = lesson;
        this.keyPoints = keyPoints;
        this.quiz = quiz;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public int getMinutes() {
        return minutes;
    }

    public void setMinutes(int minutes) {
        this.minutes = minutes;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public List<String> getLesson() {
        return lesson;
    }

    public void setLesson(List<String> lesson) {
        this.lesson = lesson;
    }

    public List<String> getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(List<String> keyPoints) {
        this.keyPoints = keyPoints;
    }

    public List<QuizQuestion> getQuiz() {
        return quiz;
    }

    public void setQuiz(List<QuizQuestion> quiz) {
        this.quiz = quiz;
    }
}