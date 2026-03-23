package com.photocopy.backend.dto.response;

public record ProductOrderResponse(
    Long productId,
    String productName,
    int quantity,
    Long price
) {}
