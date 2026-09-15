package com.sortcraft.backend.model;

public enum SortOrder {
    asc("asc"),
    desc("desc");

    private final String wire;

    SortOrder(String wire) {
        this.wire = wire;
    }

    public String wire() {
        return wire;
    }

    /** Accepts the lowercase query representation "asc" / "desc". */
    public static SortOrder fromWire(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Missing sort order");
        }
        for (SortOrder order : values()) {
            if (order.wire.equalsIgnoreCase(value)) {
                return order;
            }
        }
        throw new IllegalArgumentException("Unknown sort order: " + value);
    }
}