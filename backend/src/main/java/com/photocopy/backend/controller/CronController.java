package com.photocopy.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CronController {
    @GetMapping("/checkCron")
    public String checkCron() {
        return "Cron job is running";
    }
}
