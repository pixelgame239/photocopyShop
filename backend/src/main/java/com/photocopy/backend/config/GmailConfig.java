package com.photocopy.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;

@Configuration
public class GmailConfig {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.refresh-token}")
    private String refreshToken;

    @Bean
    public Gmail gmailService() throws Exception {
        // Khởi tạo Transport an toàn
        final NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        
        // Cấu hình Credentials dùng Refresh Token
        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

        // Tạo Gmail Service
        return new Gmail.Builder(
                httpTransport, 
                GsonFactory.getDefaultInstance(), 
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("PhotocopyShop")
                .build();
    }
}