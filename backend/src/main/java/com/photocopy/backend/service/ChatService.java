package com.photocopy.backend.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.photocopy.backend.constant.MessageType;
import com.photocopy.backend.dto.request.ChatRequest;
import com.photocopy.backend.dto.response.BoxChatResponse;
import com.photocopy.backend.dto.response.ChatResponse;
import com.photocopy.backend.entity.BoxChat;
import com.photocopy.backend.entity.ChatMessage;
import com.photocopy.backend.exception.ForbiddenException;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.repository.BoxChatRepository;
import com.photocopy.backend.repository.ChatMessageRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BoxChatRepository boxChatRepository;
    
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public List<BoxChatResponse> getAllBoxChats() {
        return boxChatRepository.findAllByOrderByLastUpdatedDesc().stream()
                .map(boxChat -> new BoxChatResponse(
                        boxChat.getId(),
                        boxChat.getParticipant(),
                        boxChat.isStaffRead(),
                        boxChat.isUserRead(),
                        boxChat.getLastUpdated()
                ))
                .toList();
    }

    public boolean getUserBoxChatStatus(String participant, Authentication authentication) {
        String tempName = authentication != null ? authentication.getName() : "Guest";
        String expectedParticipant = tempName.concat("_").concat(participant);
        return boxChatRepository.existsByParticipantAndUserReadFalse(expectedParticipant);
    }

    public List<ChatResponse> getMessages(Long boxChatId, String participant, Authentication authentication) {
        boolean isStaff = authentication != null && (authentication.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_STAFF") || auth.getAuthority().equals("ROLE_ADMIN")));
        if(!isStaff){
            if(!boxChatRepository.existsByParticipantAndId(participant, boxChatId)){
                throw new ForbiddenException("You do not have access to this chat");
            }
        }
        return chatMessageRepository.findByBoxChatIdOrderByTimestampAsc(boxChatId).stream()
                .map(chatMessage -> new ChatResponse(
                        chatMessage.getId(),
                        chatMessage.getSender(),
                        chatMessage.getContent(),
                        chatMessage.getTimestamp(),
                        chatMessage.getBoxChat().getId()
                ))
                .toList();
    }

    public Long markBoxChatAsRead(String participant, Authentication authentication) {
        BoxChat boxChat = boxChatRepository.findByParticipant(participant)
                .orElseThrow(() -> new NotFoundException("BoxChat not found for participant: " + participant));
        String role = authentication != null ? authentication.getAuthorities().iterator().next().getAuthority() : "ROLE_GUEST";
        boolean isStaff = role.equals("ROLE_STAFF") || role.equals("ROLE_ADMIN");
        boolean markedAsRead = false;
        if (isStaff) {
            if (!boxChat.isStaffRead()) {
                boxChat.markAsReadByStaff();
                markedAsRead = true;
            }
        } else {
            if(!boxChat.isUserRead()) {
                boxChat.markAsReadByUser();
                markedAsRead = true;
            }
        }
        if (markedAsRead) {
            boxChatRepository.save(boxChat);
            
            Map<String, Object> readReceipt = new HashMap<>();
            readReceipt.put("type", "READ_RECEIPT");
            readReceipt.put("boxChatId", boxChat.getId());
            readReceipt.put("participant", participant);
            readReceipt.put("readBy", isStaff ? "STAFF" : "USER");

            if (isStaff) {
                messagingTemplate.convertAndSendToUser(participant, "/queue/messages", readReceipt);
            } else {
                messagingTemplate.convertAndSend("/topic/support.staff",  (Object)readReceipt);
            }
        }
        return boxChat.getId();
    }

    @Transactional
    public void sendMessage(ChatRequest request, Authentication authentication){ 
        String receiver = request.getReceiver();
        String sender = authentication != null ? authentication.getName():null;
        String role = authentication != null ? authentication.getAuthorities().iterator().next().getAuthority() : "ROLE_GUEST";
        boolean isStaff = role.equals("ROLE_STAFF") || role.equals("ROLE_ADMIN");
        if (isStaff) {
        BoxChat boxChat = boxChatRepository.findByParticipant(receiver).orElseThrow(() -> new NotFoundException("BoxChat not found for participant: " + receiver));
        ChatMessage newMessage = ChatMessage.builder()
                .sender("STAFF")
                .boxChat(boxChat)
                .content(request.getContent())
                .timestamp(Instant.now())
                .build();
            ChatMessage savedMessage = chatMessageRepository.save(newMessage);
            ChatResponse response = new ChatResponse(
            savedMessage.getId(),
            savedMessage.getSender(),
            savedMessage.getContent(),
            savedMessage.getTimestamp(),
            boxChat.getId()
            );
            messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/messages",
                response
            );
            messagingTemplate.convertAndSend("/topic/support.staff", response);
            boxChat.markAsUnreadByUser();
            boxChat.updateLastUpdated();
            boxChatRepository.save(boxChat);
            return;
        }
        if ("STAFF".equals(receiver)) {
            MessageType boxType = sender.startsWith("Guest")
            ? MessageType.GUEST
            : MessageType.AUTHENTICATED;
            BoxChat boxChat = boxChatRepository.findByParticipant(sender).orElseGet(() -> {
                BoxChat newBoxChat = BoxChat.builder()
                        .participant(sender)
                        .staffRead(false)
                        .userRead(true)
                        .lastUpdated(Instant.now())
                        .messageType(boxType)
                        .build();
                return boxChatRepository.save(newBoxChat);
            });
            boxChat.markAsUnreadByStaff();
            boxChat.updateLastUpdated();
            boxChatRepository.save(boxChat);
            ChatMessage savedMessage = ChatMessage.builder()
                    .sender(sender)
                    .boxChat(boxChat)
                    .content(request.getContent())
                    .timestamp(Instant.now())
                    .build();
            chatMessageRepository.save(savedMessage);
            ChatResponse response = new ChatResponse(
                savedMessage.getId(),
                savedMessage.getSender(),
                savedMessage.getContent(),
                savedMessage.getTimestamp(),
                boxChat.getId()
            );
            messagingTemplate.convertAndSendToUser(
                sender,
                "/queue/messages",
                response
            );
            messagingTemplate.convertAndSend("/topic/support.staff", response);
        } else {
            throw new ForbiddenException("Only messages to staff are allowed for non-staff users");
        }
    }
}