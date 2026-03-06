package com.photocopy.backend.dto.response;

import java.time.Instant;

public record BoxChatResponse(
    Long id,
    String participant,
    boolean staffRead,
    boolean userRead,
    Instant lastUpdated
) {}
