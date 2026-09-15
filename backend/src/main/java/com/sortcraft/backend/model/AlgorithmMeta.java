package com.sortcraft.backend.model;

import java.util.List;

public class AlgorithmMeta {
    private String id;
    private String name;
    private String family;
    private String tagline;
    private String description;
    private Complexity complexity;
    private List<String> pseudocode;
    private String javaCode;

    public AlgorithmMeta() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFamily() {
        return family;
    }

    public void setFamily(String family) {
        this.family = family;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Complexity getComplexity() {
        return complexity;
    }

    public void setComplexity(Complexity complexity) {
        this.complexity = complexity;
    }

    public List<String> getPseudocode() {
        return pseudocode;
    }

    public void setPseudocode(List<String> pseudocode) {
        this.pseudocode = pseudocode;
    }

    public String getJavaCode() {
        return javaCode;
    }

    public void setJavaCode(String javaCode) {
        this.javaCode = javaCode;
    }
}