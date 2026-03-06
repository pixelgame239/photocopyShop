package com.photocopy.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import com.photocopy.backend.dto.request.ChatRequest;
import com.photocopy.backend.dto.response.BoxChatResponse;
import com.photocopy.backend.dto.response.ChatResponse;
import com.photocopy.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;



@Controller
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    @MessageMapping("/support.send")
    public void sendSupportMessage(@Payload ChatRequest message, Authentication authentication) {
      chatService.sendMessage(message, authentication);
    }
    @GetMapping("/staff/getBoxChats")
    public ResponseEntity<List<BoxChatResponse>> getBoxchats(Authentication authentication) {
        return ResponseEntity.ok(chatService.getAllBoxChats());
    }
    @GetMapping("/getBoxChatStatus/{participant}")
    public ResponseEntity<Boolean> getBoxChatStatus(@PathVariable String participant, Authentication authentication) {
        boolean status = chatService.getUserBoxChatStatus(participant, authentication);
        return ResponseEntity.ok(status);
    }
    @PatchMapping("/markAsRead/{participant}")
    public ResponseEntity<Long> markBoxChatAsRead(@PathVariable String participant, Authentication authentication) {
        Long boxChatId = chatService.markBoxChatAsRead(participant, authentication);
        return ResponseEntity.ok(boxChatId);
    }
    @GetMapping("/getMessages/{boxChatId}")
    public ResponseEntity<List<ChatResponse>> getMessages(@PathVariable Long boxChatId, @RequestParam String participant, Authentication authentication) {
        return ResponseEntity.ok(chatService.getMessages(boxChatId, participant, authentication));
    }
    
}
