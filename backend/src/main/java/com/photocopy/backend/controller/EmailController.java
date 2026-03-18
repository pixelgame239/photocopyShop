package com.photocopy.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.photocopy.backend.dto.request.SignupRequest;
import com.photocopy.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class EmailController {
    private final UserService userService;

    @PostMapping("/sendVerification")
    public ResponseEntity<?> sendVerification(@Valid @RequestBody SignupRequest request) {
        try {
            userService.preSignup(request);
            return ResponseEntity.ok("Mã xác thực đã được gửi!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping(value = "/verificationtemplate", produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView viewVerificationTemplate() {
        ModelAndView mv = new ModelAndView("emailVerification");
        mv.addObject("fullName", "Người dùng");
        mv.addObject("verificationCode", "123456");
        return mv;
    }
}