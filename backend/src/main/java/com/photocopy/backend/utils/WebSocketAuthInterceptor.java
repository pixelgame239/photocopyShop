package com.photocopy.backend.utils;

import java.util.List;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.photocopy.backend.security.JwtProvider;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    private final JwtProvider jwtProvider;
@Override
public Message<?> preSend(Message<?> message, MessageChannel channel) {

    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        String principalName;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Authentication authentication = jwtProvider.getAuthentication(token);
            String userID = authentication.getName();
            String fullName = accessor.getFirstNativeHeader("FullName");
            principalName = (fullName != null) ? userID.concat("_").concat(fullName) : userID;
            UsernamePasswordAuthenticationToken customAuth = new UsernamePasswordAuthenticationToken(
                    principalName, 
                    null, 
                    authentication.getAuthorities()
            );
            accessor.setUser(customAuth);
        }
        else{
            String fullName = accessor.getFirstNativeHeader("FullName");
            principalName = "Guest_".concat(fullName != null ? fullName : "Unknown");
            UsernamePasswordAuthenticationToken guestAuth = new UsernamePasswordAuthenticationToken(
                principalName, 
                null, 
                List.of(new SimpleGrantedAuthority("ROLE_GUEST"))
        );
        accessor.setUser(guestAuth);
        }
    }

    return message;
}
}
