package com.photocopy.backend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.photocopy.backend.repository.BoxChatRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChatMessageCleanup {
    private final BoxChatRepository boxChatRepository;
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupChatMessages() {
        boxChatRepository.deleteByMessageTypeEquals("GUEST");
    }
}
