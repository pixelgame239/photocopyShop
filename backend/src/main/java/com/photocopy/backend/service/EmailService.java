package com.photocopy.backend.service;

import java.io.ByteArrayOutputStream;
import java.util.Properties;

import org.apache.commons.codec.binary.Base64;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;

import jakarta.mail.Message.RecipientType;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final Gmail gmailService;
    private final TemplateEngine templateEngine;

    public void sendVerificationEmail(String to, String userName, String code) throws Exception {
        // 1. Chuẩn bị dữ liệu cho Template
        org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
        context.setVariable("fullName", userName);
        context.setVariable("verificationCode", code);

        // 2. Render HTML từ template
        String bodyHtml = templateEngine.process("emailVerification", context);

        // 3. Gọi hàm send đã có của bạn
        sendEmail(to, "Mã xác thực tài khoản PhotocopyShop", bodyHtml);
    }

    public void sendEmail(String to, String subject, String bodyHtml) throws Exception {
        // 1. Khởi tạo nội dung Mail bằng Jakarta Mail
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage emailContent = new MimeMessage(session);

        // "me" là keyword để Gmail API biết gửi từ chính tài khoản chủ token
        emailContent.setFrom(new InternetAddress("me"));
        emailContent.addRecipient(RecipientType.TO, new InternetAddress(to));
        emailContent.setSubject(subject);
        
        // Hỗ trợ cả HTML để gửi mail chuyên nghiệp
        emailContent.setContent(bodyHtml, "text/html; charset=utf-8");

        // 2. Chuyển đổi sang định dạng Raw Base64 URL Safe cho Gmail API
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        String encodedEmail = Base64.encodeBase64URLSafeString(buffer.toByteArray());

        // Tạo Object Message của Google API
        Message message = new Message();
        message.setRaw(encodedEmail);

        // 3. Thực thi gọi API (Tận dụng Virtual Threads nếu đã bật trong application.yml)
        gmailService.users().messages().send("me", message).execute();
    }
}