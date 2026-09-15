package com.sortcraft.backend.model;

import java.util.List;

/** Request body for {@code POST /api/sort}. */
public record SortRequest(List<Integer> array, String algorithm, String order) {
}