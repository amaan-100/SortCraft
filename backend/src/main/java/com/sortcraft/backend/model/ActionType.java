package com.sortcraft.backend.model;

/**
 * Mirrors the chart highlight actions emitted by the TypeScript step engine.
 * Serialized by their name, e.g. "COMPARE", "SWAP", "INSERT".
 */
public enum ActionType {
    COMPARE,
    SWAP,
    INSERT,
    SHIFT,
    OVERWRITE,
    PIVOT,
    MARK_SORTED,
    COMPLETE
}