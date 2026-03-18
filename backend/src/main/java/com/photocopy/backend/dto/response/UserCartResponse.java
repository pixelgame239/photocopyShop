package com.photocopy.backend.dto.response;

public record UserCartResponse(    
    Long productId,
    String productName,
    Long productPrice,
    int quantity
) {}