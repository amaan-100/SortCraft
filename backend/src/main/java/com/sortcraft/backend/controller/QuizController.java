package com.sortcraft.backend.controller;

import com.sortcraft.backend.model.QuizScoreRequest;
import com.sortcraft.backend.model.QuizScoreResponse;
import com.sortcraft.backend.service.QuizScorer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/quiz/score")
public class QuizController {

    @PostMapping
    public ResponseEntity<?> score(@RequestBody QuizScoreRequest request) {
        if (request == null || request.answers() == null) {
            return ResponseEntity.badRequest()
                    .body("Missing levelId or answers");
        }

        Set<String> seen = new HashSet<>();
        List<String> duplicates = new ArrayList<>();
        for (var answer : request.answers()) {
            if (answer.getQuestionId() != null && !seen.add(answer.getQuestionId())) {
                duplicates.add(answer.getQuestionId());
            }
        }
        if (!duplicates.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Duplicate question ids: " + duplicates);
        }

        try {
            QuizScoreResponse response = QuizScorer.score(request.levelId(), request.answers());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        }
    }
}