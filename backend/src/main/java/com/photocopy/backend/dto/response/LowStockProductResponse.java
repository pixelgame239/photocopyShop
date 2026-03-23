package com.photocopy.backend.dto.response;

public record LowStockProductResponse(
    Long productId,
    String productName,
    String imageUrl,
    Long stock
) {}
