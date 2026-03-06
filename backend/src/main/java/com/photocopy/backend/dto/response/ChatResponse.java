package com.photocopy.backend.dto.response;

import java.time.Instant;

public record ChatResponse(
    Long id,
    String sender,
    String content,
    Instant timestamp,
    Long boxChatId
) {}

