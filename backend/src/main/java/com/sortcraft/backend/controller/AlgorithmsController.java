package com.sortcraft.backend.controller;

import com.sortcraft.backend.data.AlgorithmCatalog;
import com.sortcraft.backend.model.AlgorithmMeta;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/algorithms")
public class AlgorithmsController {

    @GetMapping
    public List<AlgorithmMeta> algorithms() {
        return AlgorithmCatalog.all();
    }
}