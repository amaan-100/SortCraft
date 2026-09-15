package com.sortcraft.backend.controller;

import com.sortcraft.backend.engine.SortEngine;
import com.sortcraft.backend.model.SortOrder;
import com.sortcraft.backend.model.SortRequest;
import com.sortcraft.backend.model.SortStep;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sort")
public class SortController {

    private static final int MAX_ARRAY_SIZE = 10000;
    private static final List<String> KNOWN_ALGORITHMS = List.of(
            "bubble", "selection", "insertion", "shell", "merge", "quick", "heap");

    @PostMapping
    public List<SortStep> sort(@RequestBody SortRequest request) {
        if (request == null || request.array() == null || request.algorithm() == null) {
            throw new IllegalArgumentException("Missing array or algorithm");
        }
        if (request.array().size() > MAX_ARRAY_SIZE) {
            throw new IllegalArgumentException("Array too large (max " + MAX_ARRAY_SIZE + " elements)");
        }
        if (!KNOWN_ALGORITHMS.contains(request.algorithm())) {
            throw new IllegalArgumentException("Unknown algorithm: " + request.algorithm());
        }

        int[] array = new int[request.array().size()];
        for (int i = 0; i < array.length; i++) {
            Integer value = request.array().get(i);
            if (value == null) {
                throw new IllegalArgumentException("Array contains a null value");
            }
            array[i] = value;
        }

        String orderValue = request.order() == null || request.order().isBlank()
                ? "asc" : request.order();
        SortOrder order = SortOrder.fromWire(orderValue);

        return SortEngine.generateSteps(request.algorithm(), array, order);
    }
}