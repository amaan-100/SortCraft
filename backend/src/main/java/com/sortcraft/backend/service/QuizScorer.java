package com.sortcraft.backend.service;

import com.sortcraft.backend.data.LevelCatalog;
import com.sortcraft.backend.model.AnswerSubmission;
import com.sortcraft.backend.model.CheckedAnswer;
import com.sortcraft.backend.model.Level;
import com.sortcraft.backend.model.QuizQuestion;
import com.sortcraft.backend.model.QuizScoreResponse;

import java.util.*;

/**
 * Java port of the answer-checking logic inside the Supabase
 * {@code record_quiz_attempt()} RPC. Mirrors the authoritative scoring exactly:
 * counts valid answers, checks correctness against a server-owned answer key,
 * computes pass/fail and XP. XP rounding matches Postgres' {@code round()}.
 */
public final class QuizScorer {

    private static final Map<Integer, Integer> EXPECTED_TOTALS = Map.ofEntries(
            Map.entry(1, 3), Map.entry(2, 4), Map.entry(3, 3), Map.entry(4, 3), Map.entry(5, 3),
            Map.entry(6, 4), Map.entry(7, 4), Map.entry(8, 4), Map.entry(9, 3), Map.entry(10, 4));

    private static final Map<Integer, Integer> XP_REWARDS = Map.ofEntries(
            Map.entry(1, 80), Map.entry(2, 100), Map.entry(3, 100), Map.entry(4, 100), Map.entry(5, 120),
            Map.entry(6, 140), Map.entry(7, 140), Map.entry(8, 140), Map.entry(9, 140), Map.entry(10, 180));

    private QuizScorer() {
    }

    /**
     * @param levelId  1–10
     * @param answers  browser-supplied selections keyed by stable question id
     * @return computed score, pass/fail, XP and per-question correctness
     * @throws IllegalArgumentException when the payload is invalid or incomplete
     */
    public static QuizScoreResponse score(int levelId, List<AnswerSubmission> answers) {
        Integer expectedTotal = EXPECTED_TOTALS.get(levelId);
        if (expectedTotal == null) {
            throw new IllegalArgumentException("Invalid level: " + levelId);
        }
        int xpReward = XP_REWARDS.get(levelId);

        if (answers == null || answers.isEmpty()) {
            throw new IllegalArgumentException("Invalid answer payload");
        }

        Level level = LevelCatalog.byId(levelId);
        if (level == null) {
            throw new IllegalArgumentException("Level " + levelId + " not found");
        }

        Map<String, QuizQuestion> questionsById = new LinkedHashMap<>();
        for (QuizQuestion q : level.getQuiz()) {
            questionsById.put(q.getId(), q);
        }

        int answerCount = answers.size();
        int distinctCount = (int) answers.stream().map(AnswerSubmission::getQuestionId).distinct().count();

        int validCount = 0;
        int score = 0;
        List<CheckedAnswer> checked = new ArrayList<>(answerCount);

        for (AnswerSubmission submission : answers) {
            String qId = submission.getQuestionId();
            Integer selected = submission.getSelected();

            QuizQuestion question = questionsById.get(qId);
            if (question == null || selected == null) {
                checked.add(new CheckedAnswer(qId, selected, false));
                continue;
            }

            boolean valid = selected >= 0 && selected < question.getOptions().size();
            if (valid) validCount++;

            boolean correct = valid && selected == question.getAnswer();
            if (correct) score++;

            checked.add(new CheckedAnswer(qId, selected, correct));
        }

        if (answerCount != expectedTotal || distinctCount != expectedTotal || validCount != expectedTotal) {
            throw new IllegalArgumentException("Invalid or incomplete answer payload");
        }

        boolean passed = score * 1.0 / expectedTotal >= LevelCatalog.PASS_RATIO;
        int xp = passed ? (int) Math.round(xpReward * score / (double) expectedTotal) : 0;

        return new QuizScoreResponse(score, expectedTotal, passed, xp, xpReward, checked);
    }
}