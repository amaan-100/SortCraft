package com.sortcraft.backend.controller;

import com.sortcraft.backend.data.LevelCatalog;
import com.sortcraft.backend.model.Level;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
public class LevelsController {

    @GetMapping
    public List<Level> levels() {
        return LevelCatalog.all();
    }

    @GetMapping("/{id}")
    public Level level(@PathVariable int id) {
        Level level = LevelCatalog.byId(id);
        if (level == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Level " + id + " not found");
        }
        return level;
    }
}