package com.sortcraft.backend.model;

import java.util.List;

/** Request body for {@code POST /api/quiz/score}. */
public record QuizScoreRequest(int levelId, List<AnswerSubmission> answers) {
}