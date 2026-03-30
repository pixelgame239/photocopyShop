package com.photocopy.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CronController {
    private final JdbcTemplate jdbcTemplate;
    @GetMapping("/checkCron")
    public ResponseEntity<String> checkCron() {
        try{
            jdbcTemplate.execute("SELECT 1");
            return ResponseEntity.ok("Cron job is running");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Cron job is not running: " + e.getMessage());
        }
    }
}
